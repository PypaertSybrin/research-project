export class Recipe {
    Id: string;
    Name: string;
    ImageUrl: string;
    Author: string;
    Difficulty: string;
    Time: string;
    Ingredients: [];
    Description: string;
    Instructions: [];
    Servings: string;
  
    constructor(Id: string, Name: string, ImageUrl: string, Author: string, Difficulty: string, Time: string, Ingredients: [], Desciption: string, instructions: [], Servings: string) {
      this.Id = Id;
      this.Name = Name;
      this.ImageUrl = ImageUrl;
      this.Author = Author;
      this.Difficulty = Difficulty;
      this.Time = Time;
      this.Ingredients = Ingredients;
      this.Description = Desciption;
      this.Instructions = instructions;
      this.Servings = Servings;
    }
  }