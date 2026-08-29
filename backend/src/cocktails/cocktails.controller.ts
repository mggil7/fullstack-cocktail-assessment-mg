import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Cocktails } from './cocktails.entity';
import { CocktailsService } from './cocktails.service';
import { CreateCocktailDto } from './dto/create-cocktail.dto';

@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  searchCocktails(@Query('search') search?: string): Promise<Cocktails[]> {
    return this.cocktailsService.findAll(search);
  }

  @Get(':id')
  async getCocktail(@Param('id', ParseIntPipe) id: number): Promise<Cocktails> {
    const cocktail = await this.cocktailsService.findOne(id);
    if (!cocktail) {
      throw new NotFoundException(`Cocktail with id ${id} not found`);
    }
    return cocktail;
  }

  @Post()
  newCocktail(@Body() cocktail: CreateCocktailDto): Promise<Cocktails> {
    return this.cocktailsService.create(cocktail);
  }
}
