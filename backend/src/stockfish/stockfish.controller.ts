import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { StockfishService } from './stockfish.service';
import { AnalyzeDto } from './dto/analyze.dto';

@Controller('stockfish')
export class StockfishController {
	constructor(private readonly stockfishService: StockfishService) {}

	@Post('analyze')
	async analyze(@Body() dto: AnalyzeDto) {
		const fen = dto?.fen;
		if (!fen) {
			throw new BadRequestException('fen is required');
		}

		return this.stockfishService.analyzePosition(
			fen,
			dto?.level ?? 5,
			dto?.moveTimeMs ?? 400,
		);
	}
}
