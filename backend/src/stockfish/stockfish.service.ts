import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as readline from 'readline';

export type StockfishAnalysis = {
  bestMove: string;
  depth?: number;
  positionEvaluation?: string;
  possibleMate?: string;
  pv?: string;
};

@Injectable()
export class StockfishService implements OnModuleDestroy {
  private engine: ChildProcessWithoutNullStreams | null = null;
  private rl: readline.Interface | null = null;

  private ensureEngine(level = 5) {
    if (this.engine) return;

    const bin = process.env.STOCKFISH_PATH || '/usr/bin/stockfish';
    this.engine = spawn(bin, [], { stdio: 'pipe' });
    this.rl = readline.createInterface({ input: this.engine.stdout });

    if (!this.engine || !this.rl) throw new Error('Stockfish not started');

    const send = (cmd: string) => this.engine!.stdin.write(cmd + '\n');
    const safeLevel = Math.max(0, Math.min(20, level));

    send(`setoption name Skill Level value ${safeLevel}`);
    send('isready');

    console.log(`Stockfish engine started with skill level ${safeLevel}`);
  }

  /// Analyze a position given its FEN string and return the best move and evaluation.
  /// @param fen The FEN string representing the chess position.
  /// @param level The skill level of the engine (0-20). Default is 5.
  /// @param moveTimeMs The time in milliseconds to spend analyzing the position. Default is 400ms.
  async analyzePosition(
    fen: string,
    level = 5,
    moveTimeMs = 400,
  ): Promise<StockfishAnalysis> {
    this.ensureEngine(level);

    if (!this.engine || !this.rl) throw new Error('Stockfish not started');

    const send = (cmd: string) => this.engine!.stdin.write(cmd + '\n');

    return new Promise<StockfishAnalysis>((resolve, reject) => {
      let settled = false;
      let depth: number | undefined;
      let positionEvaluation: string | undefined;
      let possibleMate: string | undefined;
      let pv: string | undefined;

      const cleanup = () => {
        clearTimeout(timeout);
        this.rl?.off('line', onLine);
      };

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Stockfish timeout'));
      }, moveTimeMs + 3000);

      const onLine = (line: string) => {
        if (line.startsWith('info')) {
          const depthMatch = line.match(/\bdepth\s+(\d+)/);
          const cpMatch = line.match(/\bscore\s+cp\s+(-?\d+)/);
          const mateMatch = line.match(/\bscore\s+mate\s+(-?\d+)/);
          const pvMatch = line.match(/\bpv\s+(.+)$/);

          if (depthMatch) depth = Number(depthMatch[1]);
          if (cpMatch) positionEvaluation = cpMatch[1];
          if (mateMatch) possibleMate = mateMatch[1];
          if (pvMatch) pv = pvMatch[1];

          return;
        }

        if (!line.startsWith('bestmove')) return;

        const move = line.split(' ')[1];
        if (!move || move === 'none') {
          if (settled) return;
          settled = true;
          cleanup();
          reject(new Error('Stockfish returned no move'));
          return;
        }

        if (settled) return;
        settled = true;
        cleanup();
        resolve({
          bestMove: move,
          depth,
          positionEvaluation,
          possibleMate,
          pv,
        });
      };

      this.rl?.on('line', onLine);

      send('uci');
      send('isready');
      send(`position fen ${fen}`);
      send(`go movetime ${moveTimeMs}`);
    });
  }

  async getBestMove(fen: string, level = 5, moveTimeMs = 400): Promise<string> {
    try {
      const analysis = await this.analyzePosition(fen, level, moveTimeMs);
      return analysis.bestMove;
    } catch (error) {
      console.error('Error analyzing position:', error);
      throw error;
    }
  }

  stopEngine() {
    if (this.rl) {
      this.rl = null;
    }

    if (this.engine) {
      this.engine.kill();
      this.engine = null;
    }
  }

  onModuleDestroy() {
    this.stopEngine();
  }
}
