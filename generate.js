#!/usr/bin/env node

var marked = require('marked');
var fs = require('fs');

main();

function main() {
    // TODO: inject output to template
    fs.writeFileSync('index.html', transform(fs.readFileSync('cv.md', 'utf-8')));
}

function transform(data) {
    var tokens = marked.lexer(data);

    var isDl = false;
    tokens = tokens.map(function(t, i) {
        if(t.type == 'list_item_start' && isDefinitionListItem(tokens[i + 1])) {
            isDl = true;

            t.type = 'html';
            t.text = '<dl>\n';
        }
        if(t.type == 'list_item_end') {
            if(isDl) {
                t.type = 'html';
                t.text = '</dl>\n';
            }

            isDl = false;
        }
        if(isDefinitionListItem(t)) {
            var parts = t.text.split('--');

            t.type = 'html';
            t.text = '    <dt>' + marked(parts[0]) + '</dt><dd>' + marked(parts[1]) + '</dd>';
        }

        return t;
    });
    tokens.links = [];

    return marked.parser(tokens);
}

function isDefinitionListItem(t) {
    return t.type == 'text' && t.text.indexOf('--') > 1;
}
