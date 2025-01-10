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
  
    constructor(Id: string, Name: string, ImageUrl: string, Author: string, Difficulty: string, Time: string, Ingredients: [], Desciption: string, instructions: []) {
      this.Id = Id;
      this.Name = Name;
      this.ImageUrl = ImageUrl;
      this.Author = Author;
      this.Difficulty = Difficulty;
      this.Time = Time;
      this.Ingredients = Ingredients;
      this.Description = Desciption;
      this.Instructions = instructions;
    }
  }