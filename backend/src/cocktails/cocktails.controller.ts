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
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Cocktails } from './cocktails.entity';
import { CocktailsService } from './cocktails.service';
import { CreateCocktailDto } from './dto/create-cocktail.dto';

@ApiTags('cocktails')
@Controller('cocktails')
export class CocktailsController {
  constructor(private readonly cocktailsService: CocktailsService) {}

  @Get()
  @ApiOperation({
    summary: 'List cocktails, optionally filtered by description',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Case-insensitive substring match on description',
  })
  @ApiOkResponse({ type: Cocktails, isArray: true })
  searchCocktails(@Query('search') search?: string): Promise<Cocktails[]> {
    return this.cocktailsService.findAll(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single cocktail by id' })
  @ApiOkResponse({ type: Cocktails })
  @ApiNotFoundResponse({ description: 'No cocktail with this id' })
  async getCocktail(@Param('id', ParseIntPipe) id: number): Promise<Cocktails> {
    const cocktail = await this.cocktailsService.findOne(id);
    if (!cocktail) {
      throw new NotFoundException(`Cocktail with id ${id} not found`);
    }
    return cocktail;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new cocktail' })
  @ApiCreatedResponse({ type: Cocktails })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({
    description: 'A cocktail with this title already exists',
  })
  newCocktail(@Body() cocktail: CreateCocktailDto): Promise<Cocktails> {
    return this.cocktailsService.create(cocktail);
  }
}
