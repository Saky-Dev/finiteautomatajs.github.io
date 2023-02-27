/* This is an object that saves functions linked to actions
 * that user can do with an state */
const stateTools = {
  'handleLink': e => { },
  'handleRemove': e => {
    delete states[e.target.innerText]
    box_drag.removeChild(e.target)
  },
  'handleDragstart': e => e.target.style.opacity = '0.4',
  'handleDragend': e => {
    const on_position = {
      'x': draggable.min_x < e.x - 30 && e.x + 30 < draggable.max_x,
      'y': draggable.min_y < e.y - 30 && e.y + 30 < draggable.max_y  
    }

    e.target.style.opacity = '1'

    if (on_position.x && on_position.y) {
      e.target.style.left = `${e.x - 30}px`
      e.target.style.top = `${e.y - 30}px`
    }
  },
  'handleContextmenu': e => {
    e.preventDefault()
    
    box_contextmenu.style.top = `${e.y}px`
    box_contextmenu.style.left = `${e.x}px`
    box_contextmenu.className = 'contextmenu visible'
  }
}

/* This function can add an state to drag area, first create an button DOM element
 * then evaluate if the position to add the button in on area. The name of the
 * state is requested to user, if the name is empty there are a preconfigured name,
 * the button is linked with its fucntions, then its position is asigned and
 * finally if all its alright the node is added to drag area and into states */
const handleAdd = e => {
  const node = document.createElement('button')
  const on_position = {
    'x': draggable.min_x < e.x - 30 && e.x + 30 < draggable.max_x,
    'y': draggable.min_y < e.y - 30 && e.y + 30 < draggable.max_y
  }

  let name = prompt('Nombre del estado:')
  let positioned = false

  node.className = 'state'
  node.draggable = true

  node.innerText = name || `Q${state_num++}`
  node.addEventListener('dragstart', stateTools['handleDragstart'])
  node.addEventListener('dragend', stateTools['handleDragend'])
  node.addEventListener('contextmenu', evt => action === 'Cursor' ? stateTools['handleContextmenu'](evt) : false)
  node.addEventListener('click', evt => stateTools[`handle${action}`](evt) ?? false)

  if (on_position.x && on_position.y) {
    node.style.left = `${e.x - 30}px`
    node.style.top = `${e.y - 30}px`
    positioned = true
  }

  if (states[node.innerText] || !positioned)
    alert(!positioned ? 'El punto debe estar dentro del area' : 'El estado ya existe')
  else {
    box_drag.appendChild(node)
    states[`${node.innerText}`] = {
      'transitions': {},
      'isInitial': false,
      'isFinal': false
    }
  }
}

/* DOM elements */
const box_contextmenu = document.querySelector('div#drag div.contextmenu')
const box_drag = document.querySelector('div#drag')

/* Get size and position of drag area*/
const draggable = {
  min_x: box_drag.offsetLeft,
  min_y: box_drag.offsetTop,
  max_y: box_drag.offsetTop + box_drag.offsetHeight,
  max_x: box_drag.offsetLeft + box_drag.offsetWidth
}

let action = 'Cursor'
let state_num = 0

/* Here we create an anonymous array that contain the id
 * of toolbar actions, for each item we select the DOM
 * element and add to it an event on click that changes the
 * selected element and set action to same on indicated button
 */
;['cursor', 'add', 'link', 'remove'].forEach( id => {
  document.querySelector(`button#${id}`).addEventListener('click', e => {
    document.querySelector('.toolbar .selected').className = ''
    e.target.className = 'selected'
    action = `${id[0].toUpperCase()}${id.slice(1)}`
  })
})


box_drag.addEventListener('click', e => action === 'Add' ? handleAdd(e) : false)

window.addEventListener('click', () => {
  if (box_contextmenu.classList.contains('visible'))
    box_contextmenu.className = 'contextmenu hidden'
})
window.addEventListener('contextmenu', e => {
  if (box_contextmenu.classList.contains('visible'))
    e.preventDefault()
})