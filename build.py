# Rebuilds public/index.html from src/ (game UI + engine + characters).
import pathlib
root=pathlib.Path(__file__).parent
u=(root/'src/ui.html').read_text();eng=(root/'src/chars.js').read_text()+'\n'+(root/'src/engine.js').read_text()
web=u.replace('/*ENGINE*/',eng).replace("const NET='__NET__';","const NET='ws';")
web='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no"><meta name="theme-color" content="#141a33"><meta name="apple-mobile-web-app-capable" content="yes">'+web.replace('<div class="app">','</head><body>\n<div class="app">',1)+'</body></html>'
web=web.replace('<style>','<style>\nhtml{-webkit-text-size-adjust:100%}body{margin:0}img{max-width:100%}\n',1)
(root/'public/index.html').write_text(web)
print('built',len(web))
