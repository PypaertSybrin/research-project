export class Recipe {
    Id: string;
    Name: string;
    ImageUrl: string;
  
    constructor(Id: string, Name: string, ImageUrl: string) {
      this.Id = Id;
      this.Name = Name;
      this.ImageUrl = ImageUrl;
    }
  }