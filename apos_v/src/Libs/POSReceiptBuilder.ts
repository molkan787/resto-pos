const LEFT = 'left';
const RIGHT = 'right';
const CENTER = 'center';
type TextAlignment = 'left' | 'center' | 'right' | false;

class POSReceiptBuilder {

	currency: string;
	lineLength: number;
	bigTextLineLength: number = 21;
	totalLength: number;
	priceLength: number;
	quantityLength: number;
	nameLength: number;
	tPriceLength: number;
	tNameLength: number;
	showItemPrice: boolean;
	showPrices: Boolean;
	itemInBigText: boolean;

	spaceChar: string;
	separatorChar: string;
	fontSize!: {
		x: number,
		y: number
	};
	bold: boolean = false;

	addedSepAfterItems!: boolean;
	lines!: {
		font: {
			x: number,
			y: number
		},
		bold: boolean,
		text: string
	}[];

	getLineLength(){
		return this.fontSize.x == 1 ? this.bigTextLineLength : this.lineLength;
	}

	constructor(options?: any){
		const _options = options || {};

		this.currency = _options.currency || '$';
		this.itemInBigText = _options.itemInBigText || false;
		this.showItemPrice = (typeof _options.showItemPrice == 'boolean') ? _options.showItemPrice : true;
		this.showPrices = (typeof _options.showPrices == 'boolean') ? _options.showPrices : true;
		this.lineLength = _options.lineLength || 44;
		this.totalLength = _options.totalLength || 6;
		this.priceLength = _options.priceLength || 7;
		this.quantityLength = _options.quantityLength || 4;
		const itemLineLength = this.itemInBigText ? this.bigTextLineLength : this.lineLength;
		this.nameLength = itemLineLength - this.quantityLength - 1;
		if(this.showItemPrice && this.showPrices){
			this.nameLength -= (this.priceLength + 1);
		}
		if(this.showPrices){
			this.nameLength -= (this.totalLength + 1);
		}

		this.tPriceLength = this.priceLength + 2;
		this.tNameLength = this.lineLength - this.tPriceLength - 1;

		this.spaceChar = ' ';
		this.separatorChar = '-';
		this.fontSize = {
			x: 0,
			y: 0
		};
		this.clear();
	}

	clear(){
		this.lines = [];
		this.addedSepAfterItems = false;
	}

	getLines(){
		return [...this.lines];
	}

	getString(){
		return this.lines.join("\n");
	}

	// ===========================================

	addHeader(data: any, doNotCenterTitle?: boolean){
		this._fontBig();
		// this._separator(this.lineLength);
		this._line(data.title, doNotCenterTitle ? false : CENTER);

		this._fontNormal();
		let ctr = 1;
		for(let st of data.subtitles){
			this._line(st, doNotCenterTitle ? false : CENTER);
			// if(ctr++ % 2 == 0) this._separator(this.lineLength);
		}
		if(ctr % 2 == 0) this._separator(this.lineLength);
		// this._emptyLine();
		this._separator(this.lineLength);

	}

	addItem(item: any){
		this._boldText();
		const ltotal = item.q ? item.price * item.q : item.price;
		this._item({
			name: item.name,
			q: this._qty(item.q),
			price: this._price(item.price, true),
			total: this._price(ltotal, true)
		});
		this._regularText();

		const { note } = item;
		if(typeof note == 'string' && note.length > 0){
			this._item({
				name: '*' + note,
				q: '',
				price: '',
				total: '',
			})
		}
	}

	addTotalsItem(item: any, skipPriceFormating?: boolean){
		if(!this.showPrices) return;
		let nlen = this.tNameLength;
		let plen = this.tPriceLength;
		if(item.text){
			nlen = item.name.length + 1;
			plen += this.tNameLength - nlen;
		}
		this._fontNormal();
		const lp = item.leftPadding ? '      ' : '';
		let line = '';
		line += this._block(lp + item.name + ':', nlen, LEFT);
		line += this.spaceChar;
		if(item.text){
			line += this._block(item.text, plen, RIGHT);
		}else{
			line += this._block(skipPriceFormating ? item.amount : this._price(item.amount), plen, RIGHT);
		}

		if(!this.addedSepAfterItems){
			this._emptyLine();
			this.addedSepAfterItems = true;
		}

		this._line(line, RIGHT);

		if(item.isFinal){
			this._separator();
			this._emptyLine();
		}
	}

	addNormalMessage(text: string, prependSapce?: boolean, prependSep?: boolean){
		this._fontNormal();
		this._addMessage(text, prependSapce, prependSep);
	}
	
	addBigMessage(text: string, prependSapce?: boolean, prependSep?: boolean){
		this._fontBig();
		this._addMessage(text, prependSapce, prependSep);
	}

	addSeparator(fontSize?: number, prependSapce?: boolean){
		if(prependSapce) this._emptyLine();
		if(fontSize == 2) this._fontBig(); else this._fontNormal();
		this._separator(this.lineLength);
	}

	addSpace(fontSize?: number, prependSep?: boolean){
		if(prependSep) this.addSeparator(fontSize);
		this._emptyLine();
	}

	// ===========================================

	_fontNormal(){
		this.fontSize.x = 0;
		this.fontSize.y = 0;
	}

	_fontBig(){
		this.fontSize.x = 1;
		this.fontSize.y = 1;
	}

	_boldText(){
		this.bold = true;
	}

	_regularText(){
		this.bold = false;
	}

	
	_addMessage(text: string, prependSapce?: boolean, prependSep?: boolean){
		if(prependSapce) this._emptyLine();
		if(prependSep) this._separator(this.lineLength);
		this._line(text, false);
	}

	_paragraph(text: string, alignment?: TextAlignment){
		for(let ln of text.split('\n')){
			const words = ln.split(' ');
			const lines = [];
			let line = '';
			for(let word of words){
				const es = line.length > 0;
				if(line.length + word.length + (es ? 1 : 0) > this.lineLength){
					lines.push(line);
					line = word;
				}else{
					line += (es ? ' ' : '') + word;
				}
			}
			if(line.length) lines.push(line);
			for(let line of lines){
				this._line(line, alignment);
			}
		}
	}

	_item(item: any){
		let line = '';
		line += this._block(item.q + ' x', this.quantityLength, RIGHT);
		line += this.spaceChar;
		line += this._block(item.name, this.nameLength);
		line += this.spaceChar;
		if(this.showItemPrice && this.showPrices){
			line += this._block(item.q ? item.price : '', this.priceLength, RIGHT);
			line += this.spaceChar;
		}
		line += this._block(item.total, this.totalLength, RIGHT);

		this.itemInBigText ? this._fontBig() : this._fontNormal();
		this._line(line);
	}

	_block(text: string, size: number, align?: TextAlignment){
		const spacesCount = size - text.length;
		if(spacesCount == 0){
			return text;
		}else if(spacesCount < 0){
			return text.substring(0, size);
		}

		if(align == RIGHT){
			return this._getSpaces(spacesCount) + text;
		}else if(align == CENTER){
			const rp = Math.round(spacesCount / 2);
			const lp = spacesCount - rp;
			return this._getSpaces(lp) + text + this._getSpaces(rp);
		}else{ // Default align 'left'
			return text + this._getSpaces(spacesCount);
		}
	}

	_getSpaces(n: number){
		return this.spaceChar.repeat(n);
	}

	_separator(w?: number){
		this._line(this.separatorChar.repeat(w || this.lineLength), w ? false : CENTER);
	}

	_underline(){
		let line = '';
		let str = this.lines[this.lines.length-1].text;
		for(let chr of str){
			line += chr == ' ' ? ' ' : this.separatorChar; 
		}
		this._line(line, false);
	}

	_emptyLine(){
		this._line('', false);
	}

	_line(line: string, align?: TextAlignment){
		let str;
		if(typeof align == 'boolean' && !align){
			str = line;
		}else{
			const block = this._block(line, this.getLineLength(), align);
			str = block;
		}
		this.lines.push({
			font: {...this.fontSize},
			bold: this.bold,
			text: str,
		});
	}

	// ------------------------------------------

	_price(value: any, skipCurrency: boolean = false){
		const cs = skipCurrency ? '' : this.currency;
		let val = parseFloat(value);
		if(val >= 0){
			return cs + val.toFixed(2);
		}else{
			const negSign = skipCurrency ? '-' : '- ';
			val *= -1;
			return negSign + cs + val.toFixed(2);
		}
	}

	_qty(q: number){
		return q ? q : '';
	}
}

export default POSReceiptBuilder;