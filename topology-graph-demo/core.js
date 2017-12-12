var cy = cytoscape({
  container: document.querySelector('#cy'),

  boxSelectionEnabled: true,
  autounselectify: true,

  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        // 'content': '<front>tt</front>',
        'width': 120,
        'height': 120,
        'text-valign': 'center',
        'color': 'white',
        'text-halign': 'center',
        'text-outline-width': 2,
        'background-color': 'white',
        'text-outline-color': '#999',
        'border-width': 2,
        'border-color': '#00CCFF'
      })
    .selector('edge')
      .css({
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#ccc',
        'line-color': '#ccc',
        'width': 1,
        'label': 'rpc',
        'text-rotation': 'autorotate'
      })
    .selector(':selected')
      .css({
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      })
    .selector('.faded')
      .css({
        'opacity': 0.25,
        'text-opacity': 0
      }),

  elements: {
    nodes: [
      { data: { id: '1', name: 'frontend', calls: 1240} },
      { data: { id: '11', name: 'backend1', calls: 1241 } },
      { data: { id: '12', name: 'backend2', calls: 1242 } },
      { data: { id: '13', name: 'frontend', calls: 1240} },
      { data: { id: '14', name: 'frontend', calls: 1240} },
      { data: { id: '15', name: 'frontend', calls: 1240} },
      { data: { id: '16', name: 'frontend', calls: 1240} },
      { data: { id: '17', name: 'frontend', calls: 1240} },
      { data: { id: '18', name: 'frontend', calls: 1240} },
      { data: { id: '19', name: 'frontend', calls: 1240} },
      { data: { id: '20', name: 'frontend', calls: 1240} }
    ],
    edges: [
      { data: { source: '1', target: '11' } },
      { data: { source: '1', target: '17' } },
      { data: { source: '1', target: '13' } },
      { data: { source: '11', target: '12' } },
      { data: { source: '13', target: '14' } },
      { data: { source: '13', target: '15' } },
      { data: { source: '13', target: '16' } },
      { data: { source: '17', target: '18' } },
      { data: { source: '17', target: '19' } },
      { data: { source: '19', target: '20' } }
    ]
  },

  layout: {
      name: 'cose-bilkent',
      animate: false,
      idealEdgeLength: 100,
  }
});

cy.nodeHtmlLabel(
[
    {
        query: 'node', // cytoscape query selector
        halign: 'center', // title vertical position. Can be 'left',''center, 'right'
        valign: 'center', // title vertical position. Can be 'top',''center, 'bottom'
        halignBox: 'center', // title vertical position. Can be 'left',''center, 'right'
        valignBox: 'center', // title relative box vertical position. Can be 'top',''center, 'bottom'
        cssClass: 'node-html', // any classes will be as attribute of <div> container for every title
        tpl: function(data){return  '<div class="node-percentage">95%</div><div>' + data.calls + ' calls/s</div>'
         + '<div> <img src="app.jpg" class="logo"/>0 <img src="data.jpg" class="logo"/><a href="www.baidu.com">15</a> <img src="alert.jpg" class="logo"/>99</div>'
         + '<div>App Engine</div><div>0.95 Apdex</div>'} // your html template here
    }
]);

cy.$('node').on('tap', function(evt){
  document.getElementById('selected-id').innerHTML = evt.target.id();
})

var updateData = function() {
  var target = cy.$id("1")
  target.data("calls", target.data("calls") + 100)
}

var updateLine = function() {
  cy.$("edge").style("label", "dubbo")
}

var index = 21;
var addNode = function() {
  cy.add([{data: { id: index, name: 'frontend', calls: 1240}}, {data: { source: '20', target: index }}])
  cy.layout({
      name: 'cose-bilkent',
      animate: 'end',
      idealEdgeLength: 100,
  }).run()
  index = index + 1
}
