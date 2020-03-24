import { Component, OnInit } from '@angular/core';
import { ImlService } from '../../iml.service';
import { Network } from 'vis';
import { Concept } from '../../concept';
import { ChartsModule } from 'ng2-charts';
import { range } from 'rxjs';
import ApexCharts from 'apexcharts/dist/apexcharts.common.js';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-graph-second-example',
  templateUrl: './graph-second-example.component.html',
})
export class GraphSecondExampleComponent implements OnInit {
  public datasets = [];

  public labels = [];

  public options = {
    title: {
      display: true,
      text: 'Popular concepts'
  },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };
  a = [];
  concepts = [];
  range1 = [75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75];
  types = [];
  relatedConcepts: any[] = [];
  conceptData: any = [];
  searching = false;
  searching1 = false;
  start = true;
  completed = false;
  ocus;
  conceptOcus;
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
  private _jsonURL1 = 'assets/netCase1.json';
  public getJSON1(): Observable<any> {
    return this.http.get(this._jsonURL1);
  }
  private _jsonURL2 = 'assets/netCase2.json';
  public getJSON2(): Observable<any> {
    return this.http.get(this._jsonURL2);
  }

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
  networkContainer;
  netoptions;
  originalNetworkData;

  conceptLimit = 100;
  maxvalue;
  documentLimit = 20;
  nodeData = [];
  edgeData = [];
  conceptInput = "Alabama";
  loadingAnnotations = false;
  loadingNetwork = false;
  networkLoaded = true;
  netCase1;
  netCase2;
  constructor(public dataService: ImlService,
              private http: HttpClient ) {
    this.conceptDocMap = new Map<string, Set<number>>();
    this.annotationArray = new Array<string>();
    this.rankedConceptArray = new Array<string>();
    this.arrayOfConcepts = new Array<Concept>();
    this.rankedArrayOfConcepts = new Array<Concept>();
    this.groupMap = new Map<string, number>();
    this.nodeData = [];
    this.edgeData = [];
    this.getJSON1().subscribe(data => {
      this.netCase1 = data;
    });
    this.getJSON2().subscribe(data => {
      this.netCase2 = data;
    });
  }
  ngOnInit() {
  }
  typeahead(concept: string) {
    this.dataService.getTypeahead(concept).subscribe((data: any) => {
      this.searching1 = true;
      this.start = false;
      this.relatedConcepts = data;
    });
  }
  addConcept(cui: string) {
    this.dataService.getConceptGeneralInfo(cui).subscribe((data: any) => {
      const conceptjson =
      // tslint:disable-next-line: object-literal-key-quotes
      { "bool" : data.preferredName,
      // tslint:disable-next-line: object-literal-key-quotes
      "id" : data.cui,
      // tslint:disable-next-line: object-literal-key-quotes
      "ontology" : data.ontology,
      // tslint:disable-next-line: object-literal-key-quotes
      "type" : data.semanticTypes[0]
      };
      this.concepts.push(conceptjson);
      this.searching1 = false;
    });
  }
  // tslint:disable-next-line: member-ordering
  ask(concepts: string) {
    this.searching = false;
    if (this.dataService.query === "( Repair of lung OR Repair of liver OR Repair of brain OR Repair of kidney OR Repair of heart) AND Proteomics AND ( Transferrin OR C1 esterase inhibitor OR Haptoglobins OR Hemopexin OR Antithrombins OR Plasmin OR Immunoglobulin G OR alpha 1-Antitrypsin OR Immunoglobulin M )") {
      this.originalNetworkData = this.netCase2;
      this.setNetwork(this.originalNetworkData);
    }
    if (this.dataService.query === "(Repair of lung OR Repair of liver OR Repair of brain OR Repair of kidney OR Repair of heart) AND Proteomics AND Transplantation AND Proteins AND Perfusions") {
      this.originalNetworkData = this.netCase1;
      this.setNetwork(this.originalNetworkData);
    } else {
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
      this.originalNetworkData = JSON.parse(JSON.stringify(data));
      this.setNetwork(data);
    });
    }
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

  setRanges(rng0, rng1, rng2, rng3, rng4, rng5, rng6, rng7, rng8, rng9, rng10, rng11) {
    this.range1 = [Number(rng0), Number(rng1), Number(rng2), Number(rng3), Number(rng4), Number(rng5), Number(rng6), Number(rng7), Number(rng8), Number(rng9), Number(rng10), Number(rng11)];
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

    this.netoptions = {
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

    this.networkContainer = document.getElementById('network');
    this.networkLoaded = true;
    /*
    const network = new Network(networkContainer, data, options);
    */
    this.loadingAnnotations = false;
    this.loadingNetwork = false;
    /*
    network.setSize("100%", "1000px");
    */

    //Graphs
    const listOfTypes = ['umls.AminoAcidPeptideOrProtein', 'umls.DiseaseOrSyndrome',
    'umls.OrganicChemical', 'umls.BodyPartOrganOrOrganComponent', 'umls.TherapeuticOrPreventiveProcedure',
    'umls.BiomedicalOccupationOrDiscipline',
    'umls.CellOrMolecularDysfunction', 'umls.PharmacologicSubstance', 'umls.BiologicallyActiveSubstance',
    'umls.GeneOrGenome', 'umls.Cell', 'umls.LaboratoryProcedure'];
    let indexpog = 0;
    listOfTypes.forEach(element => {
      let proteins = [];
      for (let index = 0; index < data.nodes.length; index++) {
        if (data.nodes[index].group === element) {
          proteins.push([data.nodes[index].label, data.nodes[index].id, data.nodes[index].group]);
        }
      }
      let projson = [];
      proteins.forEach(element1 => {
        projson.push({
          "label" : element1[0],
          "id" : element1[1],
          "group" : element1[2],
          "count" : 0
        });
      });
      let maxValue = 0;
      for (let index = 0; index < data.edges.length; index++) {
        projson.forEach(element2 => {
          if (element2.id === data.edges[index].from) {
            element2.count++;
            if (element2.count > maxValue) {
              maxValue = element2.count;
            }
          }
        });
      }
      let filtervalue = Number(maxValue) * (100 - this.range1[indexpog]) * 0.01;
      indexpog++;
      let filteredprojson = projson.filter(function(el, range1 = this.range1) {
        return el.count >= filtervalue;
      });
      filteredprojson.sort(function(a, b){
        return b.count - a.count;
      });
      let datacount = [];
      let datalabel = [];
      let dataid = [];
      filteredprojson.forEach(element3 => {
        datacount.push(element3.count);
        datalabel.push(element3.label);
        dataid.push(element3.id);
      });
      this.datasets.push([
        {
          label: 'number of occurrences',
          data: datacount
        }
      ]);
      this.types.push(element.replace("umls.", ""));
      this.labels.push(datalabel);
    });
    this.range1 = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10];
    this.adjustNetwork(this.originalNetworkData);
  }

  async fetchResponse(concepts: string) {
    this.conceptDocMap.clear();
    this.arrayOfConcepts = new Array<Concept>();
    this.edgeData = [];
    this.nodeData = [];
    const searchArray = concepts.split(',');
    let documents = this.dataService.docsJSON;
    this.maxvalue = documents.length;
    this.loadingAnnotations = true;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < documents.length; i++) {
      // create nodes and edges with concepts to documents
      this.edgeData.push({ from: "0", to: String(documents[i].documentId) });
      // tslint:disable-next-line: max-line-length
      this.nodeData.push({ id: String(documents[i].documentId), title: (documents[i].title + "<br>by<i> " + documents[i].corpus + "</i>"), group: "Document" });
      await this.fetchAnnotation(documents[i].documentId);
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.conceptDocMap);
        console.log(this.conceptDocMap);
      }, 5000);
    });
  }
  adjustNetwork(data, ranges =  this.range1) {
    const listOfTypes = ['umls.AminoAcidPeptideOrProtein', 'umls.DiseaseOrSyndrome',
    'umls.OrganicChemical', 'umls.BodyPartOrganOrOrganComponent', 'umls.TherapeuticOrPreventiveProcedure',
    'umls.BiomedicalOccupationOrDiscipline',
    'umls.CellOrMolecularDysfunction', 'umls.PharmacologicSubstance', 'umls.BiologicallyActiveSubstance',
    'umls.GeneOrGenome', 'umls.Cell', 'umls.LaboratoryProcedure'];
    let indexpog = 0;
    let auxiliarLabels = [];
    listOfTypes.forEach(element => {
      let proteins = [];
      for (let index = 0; index < data.nodes.length; index++) {
        if (data.nodes[index].group === element) {
          proteins.push([data.nodes[index].label, data.nodes[index].id, data.nodes[index].group]);
        }
      }
      let projson = [];
      proteins.forEach(element1 => {
        projson.push({
          "label" : element1[0],
          "id" : element1[1],
          "group" : element1[2],
          "count" : 0
        });
      });
      let maxValue = 0;
      for (let index = 0; index < data.edges.length; index++) {
        projson.forEach(element2 => {
          if (element2.id === data.edges[index].from) {
            element2.count++;
            if (element2.count > maxValue) {
              maxValue = element2.count;
            }
          }
        });
      }
      let filtervalue = Number(maxValue) * (100 - ranges[indexpog]) * 0.01;
      indexpog++;
      let filteredprojson = projson.filter(function(el) {
        return el.count > filtervalue;
      });
      filteredprojson.sort(function(a, b){
        return b.count - a.count;
      });
      let datacount = [];
      let datalabel = [];
      let dataid = [];
      filteredprojson.forEach(element3 => {
        datacount.push(element3.count);
        datalabel.push(element3.label);
        dataid.push(element3.id);
      });
      auxiliarLabels.push(datalabel);

    });
    let allLabels = [];
    auxiliarLabels.forEach(elementlabel => {
      elementlabel.forEach(elementlabel2 => {
        allLabels.push(elementlabel2);
      });
    });
    let newdata = JSON.parse(JSON.stringify(data));
    newdata.nodes = newdata.nodes.filter(function (el) {
      return allLabels.includes(el.label) ||
      el.group === 'Document';
    });
    /*
    data.edges = data.edges.filter(function (el) {
      return dataid.includes(el.from);
    });*/
    const network = new Network(this.networkContainer, newdata, this.netoptions);
    network.on("selectNode", function (params) {
      let id = params.nodes[0];
      let url = `https://watsonpow01.rch.stglabs.ibm.com/services/medical_insights/application/medical_insights/dist/annotation_viewer/annotationViewer.html?corpora=ctgov:10,medline:10,pubmed:10&document_id=${id}&query=cui:C0040679`
      window.open(url, '_blank');
    });
    this.loadingAnnotations = false;
    this.loadingNetwork = false;
    network.setSize("100%", "500px");
    this.completed = true;
  }

  async fetchAnnotation(doi: number) {
    const result = await this.dataService.getAnnotations(
    this.version, doi, this.document_section.body);
    const resultJSON = JSON.parse(JSON.stringify(result));
    const concepts = resultJSON.unstructured[0].data.concepts;
    let conceptString = "";
    if (concepts.length > 1) {
    concepts.forEach(concept => {
      /*if ( concept.preferredName === "Transferrin"
      || concept.preferredName === "Hemopexin"
      || concept.preferredName === "Haptoglobins"
      || concept.preferredName === "Plasmin"
      || concept.preferredName === "Immunoglobulin M"
      || concept.preferredName === "Antithrombins"
      || concept.preferredName === "Immunoglobulin G"
      || concept.preferredName === "C1 esterase inhibitor"
      || concept.preferredName === "alpha 1-Antitrypsin"
      )*/

      /*if ( concept.type === "umls.AminoAcidPeptideOrProtein")*/

      /*if (!this.group_ignore.includes(concept.type))*/


      {
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
  returnIcon(type: string) {
    if (type === 'PharmacologicSubstance' || type === 'OrganicChemical') {
      return 'flask';
    }
    if (type === 'BodyPartOrganOrOrganComponent') {
      return 'heart';
    }
    if (type === 'AminoAcidPeptideOrProtein') {
      return 'dna';
    }
    if (type === 'TherapeuticOrPreventiveProcedure') {
      return 'user-md';
    }
    if (type === 'BiomedicalOccupationOrDiscipline') {
      return 'book-medical';
    }
    if (type === 'DiseaseOrSyndrome' || type === 'CellOrMolecularDysfunction') {
      return 'stethoscope';
    } else {
      return 'question-circle';
    }
  }
  getConcu(data) {
    let docsPerConcept = [];
    let listConcepts = []
    this.concepts.forEach(element => {
      let docList = [];
      listConcepts.push(element.bool);
      data.edges.forEach(element1 => {
        if (element1.from === element.id) {
          docList.push(element1.to);
        }
      });
      docsPerConcept.push({"concept" : element.bool, "docs" :  docList });
    });
    this.conceptOcus = listConcepts;
    this.ocus = Array.from(Array(listConcepts.length), _ => Array(listConcepts.length).fill(0));
    console.log(this.ocus);
    for (let i = 0; i < listConcepts.length; i++) {
      for (let j = 0; j < listConcepts.length; j++) {
        let listA;
        let listB;
        docsPerConcept.forEach(element3 => {
          if (element3.concept === listConcepts[i]) {
            listA = element3.docs;
          }
        });
        docsPerConcept.forEach(element4 => {
          if (element4.concept === listConcepts[j]) {
            listB = element4.docs;
          }
        });
        for (let x = 0; x < listA.length; x++) {
          for (let y = 0; y < listB.length; y++) {
            if (listA[x] === listB[y]) {
              this.ocus[i][j] = this.ocus[i][j] + 1;
            }
          }
        }
      }
    }
    console.log(this.ocus);
    for (let i = 0; i < this.conceptOcus.length; i++) {
      if (this.conceptOcus[i] === "Immunoglobulin G") {
        this.conceptOcus[i] = "IgG";
        console.log("here");

      }
      if (this.conceptOcus[i] === "Immunoglobulin M") {
        this.conceptOcus[i] = "IgM";
        console.log("here");

      }
      if (this.conceptOcus[i] === "C1 esterase inhibitor") {
        this.conceptOcus[i] = "C1 esterase";
        console.log("here");

      }
      if (this.conceptOcus[i] === "alpha 1-Antitrypsin") {
        this.conceptOcus[i] = "Antitrypsin";
        console.log("here");

      }
    }
    console.log(this.concepts);
    console.log(JSON.stringify(this.concepts));
  }
  case2concepts(){
    this.concepts = JSON.parse('[{"bool":"Haptoglobins","id":"C0018595","ontology":"umls","type":"AminoAcidPeptideOrProtein"},{"bool":"Transferrin","id":"C0040679","ontology":"umls","type":"AminoAcidPeptideOrProtein"},{"bool":"Hemopexin","id":"C0019067","ontology":"umls","type":"AminoAcidPeptideOrProtein"},{"bool":"alpha 1-Antitrypsin","id":"C0002191","ontology":"umls","type":"AminoAcidPeptideOrProtein"},{"bool":"C1 esterase inhibitor","id":"C0540301","ontology":"umls","type":"AminoAcidPeptideOrProtein"},{"bool":"Plasmin","id":"C0016016","ontology":"umls","type":"AminoAcidPeptideOrProtein"},{"bool":"Immunoglobulin G","id":"C0020852","ontology":"umls","type":"AminoAcidPeptideOrProtein"},{"bool":"Immunoglobulin M","id":"C0020861","ontology":"umls","type":"AminoAcidPeptideOrProtein"},{"bool":"Antithrombins","id":"C0003440","ontology":"umls","type":"AminoAcidPeptideOrProtein"}]');
  }
  returnColor(type: string) {
    if (type === 'PharmacologicSubstance' || type === 'OrganicChemical') {
      return 'brown';
    }
    if (type === 'BodyPartOrganOrOrganComponent') {
      return 'darkred';
    }
    if (type === 'AminoAcidPeptideOrProtein') {
      return 'darkorange';
    }
    if (type === 'TherapeuticOrPreventiveProcedure') {
      return 'darkslateblue';
    }
    if (type === 'BiomedicalOccupationOrDiscipline') {
      return 'deeppink';
    }
    if (type === 'DiseaseOrSyndrome' || type === 'CellOrMolecularDysfunction') {
      return 'forestgreen';
    } else {
      return 'black';
    }
  }
  returnBack(item, maxvalue = this.maxvalue) {
    return "rgb(" + (255 - (Number(item) * 255 / maxvalue)) + "," + (255 - (Number(item) * 255 / maxvalue)) + ",255)";
  }
}
