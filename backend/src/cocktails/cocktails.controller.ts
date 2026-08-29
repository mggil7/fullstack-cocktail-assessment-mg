import { Body, Controller, Get, Post } from '@nestjs/common';
import { Cocktails } from './cocktails.entity';
import { CocktailsService } from './cocktails.service';
import { CreateCocktailDto } from './dto/create-cocktail.dto';

@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  searchCocktails(): Promise<Cocktails[]> {
    return this.cocktailsService.findAll();
  }

  @Post()
  newCocktail(@Body() cocktail: CreateCocktailDto): Promise<Cocktails> {
    return this.cocktailsService.create(cocktail);
  }
}
