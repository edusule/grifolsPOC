import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { timeout } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ImlService {

  constructor(private http: HttpClient) { }
  /*apiRoot = "http://watsonwrkp355.rch.stglabs.ibm.com:10111/services/medical_insights/api/v1/corpora";*/
  apiRoot = "https://watsonpow01.rch.stglabs.ibm.com/services/medical_insights/api/v1/corpora";
  version = "2019-07-10";
  limit = 250;
  verbose = false;
  conceptsJson: string;
  ontology = "umls";
  treeLayout = false;
  myUrl = "https://us-south.wh-iml.cloud.ibm.com";
  myApikey = "pudOh80jeseBhG-JO9skVsfuREiSLIuFJ7ZOqwKUrmpv";
  docsJSON;
  query;

  getTypeahead(query: string) {
    // tslint:disable-next-line: max-line-length
    const url = this.apiRoot + `/pubmed%2Cmedline%2Cctgov/search/typeahead?version=2020-01-13&query=${query}&ontologies=umls&verbose=false&_limit=20&max_hit_count=5000000&no_duplicates=true`;
    return this.http.get(url).pipe(map((data: any) => {
      return data.concepts;
    }));
  }
  getConceptGeneralInfo(cui: string) {
    // tslint:disable-next-line: max-line-length
    const url = this.apiRoot + `/medline%2Cctgov%2Cpubmed/concepts/${cui}?version=2020-01-14&ontology=umls&tree_layout=false`;
    return this.http.get(url).pipe(map((data: any) => {
        return data;
    }));
    /*
    const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'apikey': 'pudOh80jeseBhG-JO9skVsfuREiSLIuFJ7ZOqwKUrmpv'
        })
      };
    const url = `https://us-south.wh-iml.cloud.ibm.com/wh-iml/api/v1/corpora/medline%2Cctgov%2Cpubmed/concepts/${cui}?version=2020-01-14&ontology=umls&tree_layout=false`;
    return this.http.get(url, httpOptions).pipe(map((data: any) => {
        console.log(data);
        return data;
    }));
    */
  }
  getDocs(query: string, concepts) {
    // tslint:disable-next-line: max-line-length
    const url = this.apiRoot + "/ctgov%2Cmedline%2Cpubmed/search?version=2020-01-20&verbose=false";
    const body = {
        query: {
            bool: query,
            'concepts': concepts,
        },
         "returns": {
             "documents": {
                "limit": "65",
                "offset": 0
            }
        }
    };
    console.log(JSON.stringify(body));
    return this.http.post(url, body).pipe(map((data: any) => {
      return data;
    }));
  }
  getHisto(query: string, concepts) {
    // tslint:disable-next-line: max-line-length
    const url = this.apiRoot + "/ctgov%2Cmedline%2Cpubmed/search?version=2020-01-20&verbose=false";
    const body = {
        "query": {
            "bool": query,
            "concepts": concepts,
        },
         "returns": {
            "dateHistograms": {
            "publishDate": {
                "interval": "1y"
      }
    }
        }
    };
    console.log(JSON.stringify(body));
    return this.http.post(url, body).pipe(map((data: any) => {
      return data;
    }));
  }
  checkConcepts(docId: string, corpus: string, cui) {
      // tslint:disable-next-line: max-line-length
    let cuistring = "";
    cui.forEach(element => {
        cuistring = cuistring + "cuis=" + element + "&";
    });
    const url = this.apiRoot + `/${corpus}/documents/${docId}/search_matches?version=2020-01-23&min_score=.2&${cuistring}_limit=50&search_tag_begin=%3Cb%3E&search_tag_end=%3C%2Fb%3E&_fields=passages%2Cannotations%2ChighlightedTitle%2ChighlightedAbstract%2ChighlightedBody%2ChighlightedSections
    `;
    return this.http.get(url).pipe(map((data: any) => {
      return data;
    }));
  }
  getCorpora(version: string) {
      let url = this.apiRoot + "?";
      url = this.addAdjustments(url, version);
      return this.http.get(url);
  }
    async getConceptTypeAhead(corpus: string, version: string, conceptName: string) {
        let url = this.apiRoot;
        if (corpus) { url += "/" + corpus + "/"; }
        url += "search/typeahead?";
        url = this.addAdjustments(url, version);
        url += "&query=" + conceptName;
        url += "&verbose=false&_limit=20&no_duplicates=true";
        return new Promise((resolve) => {
            setTimeout(() => {  this.http.get(url).subscribe(
                data => {
                    resolve(data);
            // tslint:disable-next-line: no-unused-expression
            }), 100; });
        });
    }

    /**
     *
     * @param corpus 
     * @param version 
     * @param conceptName 
     * @param cui 
     * @param hitCount 
     */
    async getConcept(corpus: string, version: string, conceptName?: string, cui?: string, hitCount: boolean = false) {
        let url = this.apiRoot;
        if (corpus) { url += "/" + corpus + "/"; }
        url += "concepts";
        if (conceptName) {
            conceptName = conceptName.toLocaleLowerCase();
            url += "/" + encodeURI(conceptName);
        }
        if (cui) { url += "/" + String(cui); }
        if (hitCount) { url += "/hit_count"; }
        url += "?";
        url = this.addAdjustments(url, version);
        if (cui) { url += "&ontology=umls&tree_layout=false"; }
        let typeAhead = await this.getConceptTypeAhead(corpus, version, conceptName);
        return new Promise((resolve) => {
            setTimeout(() => {
                this.http.get(url).subscribe(
                    data => {
                        resolve(data);
                    },
                    err => {
                        let type = JSON.parse(JSON.stringify(typeAhead));
                        let similarConcepts: string = "";
                        if (type.concepts && type.concepts.length >= 2){
                            similarConcepts += "(e.g." + type.concepts[0].preferredName + " or " + type.concepts[1].preferredName + ")";
                        } 
                        alert("Ups, error!" + conceptName + " is not found. Try with other equivalent concepts. " + similarConcepts + " or check the spelling;"); }
                    ), 100;
            });
        }).catch(error => {
            console.log("Got error");
            alert("Please check the spelling of " + conceptName);
        });


    }


    async postBodyBuilder(concepts: Array<string>, corpus: string, version: string, limit: number, offset?: number) {
        let request: string = "";
        let conceptsString: string = "";
        if (!offset) { offset = 0; }
        for (var i = 0; i < concepts.length; i++) {
            request += concepts[i];
            var conceptData = await this.getConcept(corpus, version, concepts[i]);
            var conceptJSON = JSON.parse(JSON.stringify(conceptData));
            conceptsString += `{
                "bool": "${concepts[i]}",
                "ontology": "${conceptJSON.ontology}",
                "id":"${conceptJSON.cui}",
                "rank": "10",
                "type":"${conceptJSON.semanticTypes[0]}",
                "includeRelated": [],
                 "negated": false
                 }`;
            if (i <= concepts.length - 2) {
                request += " AND ";
                conceptsString += ",";
            }
            else { continue; }
        }

        let result: string = JSON.parse(`{"query":{
            "bool": "${request}",
            "concepts": [
                ${conceptsString}
            ]},
            "returns":{
                "documents":{
                    "limit":"${String(limit)}",
                    "offset":${String(offset)}
                }
            }
        }`);


        return result;
    }

    async postConceptSearch(concepts: Array<string>, corpus: string, version: string, limit: number, offset?: number) {
        let url = this.apiRoot;
        let body = await this.postBodyBuilder(concepts, corpus, version, limit);
        if (corpus) { url += "/" + corpus + "/"; }
        url += "search?";
        url = this.addAdjustments(url, version);
        return new Promise((resolve) => {
            setTimeout(() => {
                return this.http.post(url, body).subscribe(
                    data => {
                        resolve(data);
                    }), 5000;
            });
        });

    }


    async getAnnotations(version: string, doi: number, document_section: string, include_text: boolean = false) {
        let url = this.apiRoot;
        url += "/pubmed%2Cctgov%2Cmedline/";
        if (doi) { url += "documents/" + String(doi) + "/annotations"; }
        url += "?";
        url = this.addAdjustments(url, version);
        if (document_section) { url += "&document_section=" + document_section; }
        if (include_text) { url += "&include_text=" + String(include_text); }
        return new Promise((resolve) => {
            return this.http.get(url).subscribe(
                data => {
                    resolve(data);
                });
        });


    }


    getConceptSearch(corpus: string, version: string, resType?: string) {
        let url = this.apiRoot;
        if (corpus) { url += "corpora" + corpus + "/"; }
        url += "search";
        if (resType) { url += "/" + resType; }
        url += "?";
        this.addAdjustments(url, version);
        return this.http.get(url);
    }

    addAdjustments(url: string, version: string, limit?: number, verbose: boolean = false): string {
        if (version) { url += "version=" + version; } else { url += "version=" + this.version; }
        if (verbose) { url += "&verbose=" + String(verbose); } else { url += "&verbose=" + String(this.verbose); }
        if (limit) { url += "&_limit=" + String(limit); } else { url += "&_limit=" + String(this.limit); }
        return url;
    }


}
