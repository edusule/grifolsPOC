import { Component, OnInit } from '@angular/core';
import { ImlService } from '../../iml.service';
import { Network } from 'vis';
import { Concept } from '../../concept';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  relatedConcepts: any[] = [];
  conceptData: any = [];
  searching = true;
  start = true;
  title = 'Medical Literature Insights';
  version = "2019-07-01";
  corpus = {
    medline: "medline",
    pubmed: "pubmed",
    ctgov: "ctgov"
  };

  // tslint:disable-next-line: variable-name
  document_section = {
    abstract: "abstract",
    body: "body",
    title: "title",
    keywords: "keywords"
  };

  // tslint:disable-next-line: variable-name
  group_ignore = ["umls.Finding",
    "umls.IdeaOrConcept",
    "umls.SpatialConcept",
    "umls.QualitativeConcept",
    "umls.QuantitativeConcept",
    "umls.FunctionalConcept",
    "umls.IntellectualProduct",
    "umls.TemporalConcepts",
    "umls.Activity"

];
  conceptDocMap = new Map<string, Set<number>>();
  annotationArray = new Array<string>();
  rankedConceptArray = new Array<string>();
  arrayOfConcepts = new Array<Concept>();
  rankedArrayOfConcepts = new Array<Concept>();
  groupMap = new Map<string, number>();

  conceptLimit = 100;
  documentLimit = 20;
  nodeData = [];
  edgeData = [];
  conceptInput;
  loadingAnnotations = false;
  loadingNetwork = false;
  networkLoaded = true;
  constructor(private dataService: ImlService ) {
    this.conceptDocMap = new Map<string, Set<number>>();
    this.annotationArray = new Array<string>();
    this.rankedConceptArray = new Array<string>();
    this.arrayOfConcepts = new Array<Concept>();
    this.rankedArrayOfConcepts = new Array<Concept>();
    this.groupMap = new Map<string, number>();
    this.nodeData = [];
    this.edgeData = [];
  }
  ngOnInit() {
  }
  typeahead(concept: string) {
    this.dataService.getTypeahead(concept).subscribe((data: any) => {
      console.log(data);
      this.searching = true;
      this.start = false;
      this.relatedConcepts = data;
    });
  }
  searchConcept(cui: string) {
    this.searching = false;
    this.dataService.getConceptGeneralInfo(cui).subscribe((data: any) => {
      console.log(data);
      this.conceptData = data;
    });
  }
  // tslint:disable-next-line: member-ordering
  ask(concepts: string) {
    this.searching = false;
    this.fetchResponse(concepts).finally(() => {
      this.annotationArray = this.getAnnotationArray(this.conceptDocMap);
      this.rankedConceptArray = this.getRankedConceptArray(this.conceptLimit, this.annotationArray);
      this.setEdgesOfRankedConcepts(this.conceptDocMap, this.rankedConceptArray);
      this.setNodesOfRankedConcepts(this.rankedConceptArray);
      // tslint:disable-next-line: max-line-length
      console.log("Data collection finished: painting network of " + this.nodeData.length + " nodes and " + this.edgeData.length + " edges");
      this.loadingNetwork = true;
      const data = {
        nodes: this.nodeData,
        edges: this.edgeData
      };
      console.log(this.nodeData);
      console.log(this.groupMap);
      this.setNetwork(data);
    });
  }

  getAnnotationArray(map: Map<string, Set<number>>) {
    const array = new Array<string>();
    map.forEach((value: Set<number>, key: string) => {
      const val = value.size;
      if (array[val]) { array[val] += "," + key; } else { array[val] = String(key); }
    });
    return array;
  }

  getRankedConceptArray(counter: number, array: Array<string>) {
    let rankeString = "";
    const separator = ",";
    for (let i = array.length - 1; i > 0; i--) {
      if (array[i]) {
        const conceptsString: string = array[i];
        counter--;
        rankeString += conceptsString + ",";
        if (counter === 0) { break; }
      }
    }
    rankeString = rankeString.substring(0, rankeString.length - 1); // removing the last ","
    const rankedArray: Array<string> = rankeString.split(separator);
    return rankedArray;
  }

  setEdgesOfRankedConcepts(docMap: Map<string, Set<number>>, array: Array<string>): void {
    docMap.forEach((value: Set<number>, key: string) => {
      if (!array.includes(key)) {
        docMap.delete(key);
      } else {
        value.forEach((val) => {
          this.edgeData.push(({ from: key, to: val }));
        });
      }
    });
    this.conceptDocMap = docMap;

  }

  setNodesOfRankedConcepts(array: Array<string>) {
    this.arrayOfConcepts.forEach(concept => {
      // tslint:disable-next-line: max-line-length
      this.nodeData.push({ id: concept.cui, label: concept.name.toString(), title: (concept.name + "<br>[" + concept.type + "]"), group: concept.type });
    }
    );

  }


  setNetwork(data) {
    const white = "#ffffff";
    const black = "#000000";
    const colormatrix = [
      { color: white, backgroundcolor: '#f44336', label: 'umls.AminoAcidPeptideOrProtein' },
      { color: white, backgroundcolor: '#673ab7', label: 'umls.PharmacologicSubstance' },
      { color: white, backgroundcolor: '#e91e63', label: 'umls.QuantitativeConcept' },
      { color: white, backgroundcolor: '#9c27b0', label: 'umls.BiologicallyActiveSubstance' },
      { color: "#000000", backgroundcolor: '#87CEEB', label: 'umls.GeneOrGenome' },
      { color: "#000000", backgroundcolor: '#00bcd4', label: 'umls.Mammal' },
      { color: "#000000", backgroundcolor: '#00ffff', label: 'umls.Cell' },
      { color: white, backgroundcolor: '#009688', label: 'umls.IdeaOrConcept' },
      { color: white, backgroundcolor: '#4CAF50', label: 'umls.LaboratoryProcedure' },
      { color: "#000000", backgroundcolor: '#8bc34a', label: 'umls.DiseaseOrSyndrome' },
      { color: "#000000", backgroundcolor: '#cddc39', label: 'use 2' },
      { color: "#000000", backgroundcolor: '#fa8072', label: 'use 3' },
      { color: "#000000", backgroundcolor: '#fa8072', label: 'searchedConcept' },
      { color: white, backgroundcolor: '#795548', label: 'Document' }];

    // tslint:disable-next-line: only-arrow-functions
    const getColor = function(label) { return colormatrix.find(x => x.label === label).color; };
    // tslint:disable-next-line: only-arrow-functions
    const getBkColor = function(label) { return colormatrix.find(x => x.label === label).backgroundcolor; };

    const options = {
      nodes: {
        shape: 'dot', size: 6, font: { face: 'calibri' },
        chosen: { label(values, id, selected, hovering) { values.color = '#ff0000'; values.size = 16; values.mod = 'bold'; } },
      },

      edges: { width: 1, smooth: false, color: { color: '#DAE1FF', highlight: '#1444F5', hover: '#5AC840' } },
      groups:
      {
        Document: { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf15b', color: getBkColor('Document') } },
        // tslint:disable-next-line: max-line-length
        'umls.AminoAcidPeptideOrProtein': { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf126', color: getBkColor('umls.AminoAcidPeptideOrProtein') } },
        // tslint:disable-next-line: max-line-length
        'umls.PharmacologicSubstance': { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf1aa', color: getBkColor('umls.PharmacologicSubstance') } },
        // tslint:disable-next-line: max-line-length
        'umls.DiseaseOrSyndrome': { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf0fa', color: getBkColor('umls.DiseaseOrSyndrome') } },
        // tslint:disable-next-line: max-line-length
        'umls.BiologicallyActiveSubstance': { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf18c', color: getBkColor('umls.BiologicallyActiveSubstance') } },
        // tslint:disable-next-line: max-line-length
        'umls.GeneOrGenome': { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf1a4', color: getBkColor('umls.GeneOrGenome') } },
        'umls.Mammal': { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf1b0', color: getBkColor('umls.Mammal') } },
        'umls.Cell': { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf192', color: getBkColor('umls.Cell') } },
        // tslint:disable-next-line: max-line-length
        'umls.IdeaOrConcept': { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf0eb', color: getBkColor('umls.IdeaOrConcept') } },
        // tslint:disable-next-line: max-line-length
        'umls.LaboratoryProcedure': { shape: 'icon', icon: { face: 'FontAwesome', size: 20, code: '\uf0c3', color: getBkColor('umls.LaboratoryProcedure') } },
        searchedConcept: { shape: 'icon', icon: { face: 'FontAwesome', size: 48, code: '\uf005', color: getBkColor('searchedConcept') } }

      },
      interaction: { zoomView: true, hover: true, dragNodes: true, multiselect: true, selectConnectedEdges: false },
      manipulation: { enabled: false },
      physics: { enabled: true, solver: 'forceAtlas2Based' },
      layout: { improvedLayout: true }
    };

    const networkContainer = document.getElementById('network');
    this.networkLoaded = true;
    const network = new Network(networkContainer, data, options);
    this.loadingAnnotations = false;
    this.loadingNetwork = false;
    network.setSize("100%", "1000px");

  }


  async fetchResponse(concepts: string) {
    this.conceptDocMap.clear();
    this.arrayOfConcepts = new Array<Concept>();
    this.edgeData = [];
    this.nodeData = [];
    const searchArray = concepts.split(',');
    const result = await this.dataService.postConceptSearch(searchArray, this.corpus.medline, this.version, this.documentLimit);
    const resultJSON = JSON.parse(JSON.stringify(result));
    const documents = resultJSON.documents;
    this.nodeData = [
      { id: "0", label: searchArray.toString(), group: "searchedConcept" }
    ];
    this.loadingAnnotations = true;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < documents.length; i++) {
      // create nodes and edges with concepts to documents
      this.edgeData.push({ from: "0", to: String(documents[i].documentId) });
      // tslint:disable-next-line: max-line-length
      this.nodeData.push({ id: String(documents[i].documentId), title: (documents[i].title + "<br>by<i> " + documents[i].corpus + "</i>"), group: "Document" });
      this.fetchAnnotation(documents[i].documentId);
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.conceptDocMap);
      }, 4000);
    });
  }

  async fetchAnnotation(doi: number) {
    const result = await this.dataService.getAnnotations(
    this.version, doi, this.document_section.abstract);
    const resultJSON = JSON.parse(JSON.stringify(result));
    const concepts = resultJSON.unstructured[0].data.concepts;
    let conceptString = "";
    if (concepts.length > 1) {
    concepts.forEach(concept => {
      if (!this.group_ignore.includes(concept.type)) {
      const key = concept.cui;
      conceptString += concept.cui;
      const conceptObject = new Concept(concept.cui, concept.preferredName.toString(16), concept.type);
      if (this.conceptDocMap.has(key)) {
        const doiSet = this.conceptDocMap.get(key).add(doi);
        this.conceptDocMap.set(key, doiSet);
      } else {
        const doiSet = new Set<number>();
        doiSet.add(doi);
        this.arrayOfConcepts.push(conceptObject);
        this.conceptDocMap.set(key, doiSet);
      }
      if (this.groupMap.has(concept.type)) {
        const value = this.groupMap.get(concept.type) + 1;
        this.groupMap.set(concept.type, value);
      } else {
        this.groupMap.set(concept.type, 1);
      }
    }
  } ); }


  }

}
