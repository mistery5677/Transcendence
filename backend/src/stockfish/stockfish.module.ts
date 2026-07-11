import { Global, Module } from '@nestjs/common';
import { StockfishService } from './stockfish.service';
import { StockfishController } from './stockfish.controller';

@Module({
  providers: [StockfishService],
  controllers:[StockfishController],
  exports: [StockfishService],
})
export class StockfishModule {}
