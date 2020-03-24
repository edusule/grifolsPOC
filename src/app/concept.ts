export class Concept {
    cui: number;
    type: string;
    name: string;

    constructor(id: number, name: string, type: string) {
        this.cui = id;
        this.name = name;
        this.type = type;
    }

    getId() { return this.cui; }
    getType() { return this.type; }
    getName() { return this.name; }

    setId(id: number) { this.cui = id; }
    setType(type: string) { this.type = type; }
    setName(name: string) { this.name = name; }
}
