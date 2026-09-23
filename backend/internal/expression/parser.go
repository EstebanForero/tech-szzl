package expression

type node struct {
	kind        tokenKind
	value       float64
	left, right *node
}

type parser struct {
	tokens []token
	index  int
}

const maxDepth = 64

func parse(tokens []token) (*node, error) {
	p := &parser{tokens: tokens}
	result, err := p.parseAdd(0)
	if err != nil {
		return nil, err
	}
	if p.current().kind != tokenEOF {
		return nil, &SyntaxError{p.current().position, "unexpected token"}
	}
	return result, nil
}

func (p *parser) current() token { return p.tokens[p.index] }

func (p *parser) take() token {
	current := p.current()
	p.index++
	return current
}

func (p *parser) parseAdd(depth int) (*node, error) {
	left, err := p.parseMultiply(depth)
	if err != nil {
		return nil, err
	}
	for p.current().kind == tokenPlus || p.current().kind == tokenMinus {
		kind := p.take().kind
		right, err := p.parseMultiply(depth)
		if err != nil {
			return nil, err
		}
		left = &node{kind: kind, left: left, right: right}
	}
	return left, nil
}

func (p *parser) parseMultiply(depth int) (*node, error) {
	left, err := p.parseUnary(depth)
	if err != nil {
		return nil, err
	}
	for {
		kind := p.current().kind
		implicit := kind == tokenLeftParen || kind == tokenSquareRoot ||
			(kind == tokenNumber && p.index > 0 && p.tokens[p.index-1].kind == tokenRightParen)
		if kind != tokenMultiply && kind != tokenDivide && !implicit {
			break
		}
		if implicit {
			kind = tokenMultiply
		} else {
			p.take()
		}
		right, err := p.parseUnary(depth)
		if err != nil {
			return nil, err
		}
		left = &node{kind: kind, left: left, right: right}
	}
	return left, nil
}

func (p *parser) parseUnary(depth int) (*node, error) {
	if depth > maxDepth {
		return nil, &SyntaxError{p.current().position, "expression is nested too deeply"}
	}
	if p.current().kind == tokenPlus || p.current().kind == tokenMinus {
		kind := p.take().kind
		right, err := p.parseUnary(depth + 1)
		if err != nil {
			return nil, err
		}
		return &node{kind: kind, right: right}, nil
	}
	return p.parsePower(depth)
}

func (p *parser) parsePower(depth int) (*node, error) {
	left, err := p.parsePostfix(depth)
	if err != nil {
		return nil, err
	}
	if p.current().kind == tokenPower {
		p.take()
		right, err := p.parseUnary(depth + 1)
		if err != nil {
			return nil, err
		}
		return &node{kind: tokenPower, left: left, right: right}, nil
	}
	return left, nil
}

func (p *parser) parsePostfix(depth int) (*node, error) {
	value, err := p.parsePrimary(depth)
	if err != nil {
		return nil, err
	}
	for p.current().kind == tokenPercent {
		p.take()
		value = &node{kind: tokenPercent, left: value}
	}
	return value, nil
}

func (p *parser) parsePrimary(depth int) (*node, error) {
	current := p.current()
	switch current.kind {
	case tokenNumber:
		p.take()
		return &node{kind: tokenNumber, value: current.value}, nil
	case tokenSquareRoot:
		if depth >= maxDepth {
			return nil, &SyntaxError{current.position, "expression is nested too deeply"}
		}
		p.take()
		inside, err := p.parsePrimary(depth + 1)
		if err != nil {
			return nil, err
		}
		return &node{kind: tokenSquareRoot, left: inside}, nil
	case tokenLeftParen:
		if depth >= maxDepth {
			return nil, &SyntaxError{current.position, "expression is nested too deeply"}
		}
		p.take()
		inside, err := p.parseAdd(depth + 1)
		if err != nil {
			return nil, err
		}
		if p.current().kind != tokenRightParen {
			return nil, &SyntaxError{p.current().position, "missing closing parenthesis"}
		}
		p.take()
		return inside, nil
	default:
		return nil, &SyntaxError{current.position, "expected a number or opening parenthesis"}
	}
}
