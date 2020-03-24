import { Component, OnInit } from '@angular/core';
import { ImlService } from '../../iml.service';


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  relatedConcepts: any[] = [];
  conceptData: any = [];
  searching = true;
  start = true;
  constructor(private iml: ImlService ) {}
  ngOnInit() {
  }
  typeahead(concept: string) {
    this.iml.getTypeahead(concept).subscribe((data: any) => {
      console.log(data);
      this.searching = true;
      this.start = false;
      this.relatedConcepts = data;
    });
  }
  searchConcept(cui: string) {
    this.searching = false;
    this.iml.getConceptGeneralInfo(cui).subscribe((data: any) => {
      console.log(data);
      this.conceptData = data;
    });
  }
}
