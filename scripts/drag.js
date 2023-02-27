/* This is an object that saves functions linked to actions
 * that user can do with an state */
const stateTools = {
  /* Prevent an console error alert */
  'handleCursor': e => e.preventDefault(),
  'handleLink': e => {
    if (!link.starting) {
      link.starting = e.target
      return false
    }

    link.ending = e.target

    const position = {
      stx: link.starting.offsetLeft + 30,
      sty: link.starting.offsetTop + 30,
      edx: link.ending.offsetLeft + 30,
      edy: link.ending.offsetTop + 30
    }
    const vector = {
      'top': position.sty < position.edy ? position.sty : position.edy,
      'left': position.stx < position.edx ? position.stx : position.edx,
      'height': position.sty > position.edy ? position.sty - position.edy : position.edy - position.sty,
      'width': position.stx > position.edx ? position.stx - position.edx : position.edx - position.stx
    }
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');  
    const name = prompt('Nombre de la transición:')

    let aux_searching = 0
    let repeated = false
    let direction = {
      vertical: position.sty < position.edy ? 'down' : 'up',
      horizontal: position.stx < position.edx ? 'right' : 'left'
    }
    let m = `${direction.horizontal === 'right' ? '0' : vector.width} ${direction.vertical === 'down' ? '0' : vector.height}`
    let c = {
      c1: `${direction.horizontal === 'right' ? '0' : vector.width} ${direction.vertical === 'down' ? '0' : vector.height}`,
      c2: `${direction.horizontal === 'right' ? vector.width : '0'} ${direction.vertical === 'down' ? vector.height : '0'}`,
      c3: `${direction.horizontal === 'right' ? vector.width : '0'} ${direction.vertical === 'down' ? vector.height : '0'}`
    }

    if (name)
      Object.keys(states).forEach(id => {
        aux_searching = Object.keys(states[id].transitions).findIndex(key => key === name)

        if (aux_searching > -1) {
          repeated = true
          return false
        }
      })

    if (repeated) {
      alert('El nombre de la transición ya esta puesto')
      link = { starting: undefined, ending: undefined }
      return false
    }
    
    svg.classList.add('link')

    svg.style.top = `${vector.top}px`
    svg.style.left = `${vector.left}px`
    svg.style.height = `${vector.height}px`
    svg.style.width = `${vector.width}px`

    svg.setAttribute('viewbox', `0 0 ${vector.width} ${vector.height}`)
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    path.setAttributeNS(null, 'd', `M ${m} C ${c.c1}, ${c.c2}, ${c.c3}`)

    svg.appendChild(path)
    box_drag.appendChild(svg)

    states[link.starting.innerText].transitions[name || `a${transition_num++}`] = link.ending.innerText

    link = { starting: undefined, ending: undefined }
  },
  /* Function to remove an state first of the states' object
   * and then fron thw UI */
  'handleRemove': e => {
    delete states[e.target.innerText]
    box_drag.removeChild(e.target)
  },
  /* Visual to do a visual change when state is moving */
  'handleDragstart': e => e.target.style.opacity = '0.4',
  /* On this first check if the move is inside the drag area
   * and if its true the visual effect is removed and the
   * state is moved to the position */
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
  /* Function to hide the default context menu then set
   * the state selected is changed, change the text 
   * inside the options of context menu and make
   * visible on the state */
  'handleContextmenu': e => {
    e.preventDefault()

    ctx_selected_state = e.target

    btn_set_initial.innerText = states[e.target.innerText].isInitial
    ? 'Quitar inicial'
    : 'Agregar inicial'

    btn_set_final.innerText = states[e.target.innerText].isFinal
    ? 'Quitar final'
    : 'Agregar final'
    
    box_contextmenu.style.top = `${e.y}px`
    box_contextmenu.style.left = `${e.x}px`
    box_contextmenu.className = 'visible'
  }
}

/* This function can add an state to drag area, first create an button DOM element
 * then evaluate if the position to add the button in on area. The name of the
 * state is requested to user, if the name is empty there are a preconfigured name,
 * the button is linked with its fucntions, then its position is asigned and
 * finally if all its alright the node is added to drag area and into states */
const handleAdd = e => {
  const node = document.createElement('button')
  const name = prompt('Nombre del estado:')
  const on_position = {
    'x': draggable.min_x < e.x - 30 && e.x + 30 < draggable.max_x,
    'y': draggable.min_y < e.y - 30 && e.y + 30 < draggable.max_y
  }

  let positioned = false

  node.className = 'state'
  node.draggable = true
  node.tabIndex = '-1'

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

/* This function change the status of an state, it receive the
 * status to change and if there is a selected state the change is
 * realized, removing or adding the class to state and in the object */
const handleSetStatus = status => {
  if (!ctx_selected_state)
    return false

  const id = ctx_selected_state.innerText

  if (status === 'initial') {
    states[id].isInitial
    ? ctx_selected_state.classList.remove('initial')
    : ctx_selected_state.classList.add('initial')
    
    states[id].isInitial = !states[id].isInitial
  }
  
  if (status === 'final') {
    states[id].isFinal
    ? ctx_selected_state.classList.remove('final')
    : ctx_selected_state.classList.add('final')
    
    states[id].isFinal = !states[id].isFinal
  }

  ctx_selected_state = undefined
}

/* DOM elements */
const box_contextmenu = document.querySelector('div#contextmenu')
const box_drag = document.querySelector('div#drag')
const btn_set_initial = document.querySelector('button#set_initial')
const btn_set_final = document.querySelector('button#set_final')


/* Get size and position of drag area*/
const draggable = {
  min_x: box_drag.offsetLeft,
  min_y: box_drag.offsetTop,
  max_y: box_drag.offsetTop + box_drag.offsetHeight,
  max_x: box_drag.offsetLeft + box_drag.offsetWidth
}

/* Glogal variables */
let ctx_selected_state = undefined
let state_num = 0
let transition_num = 0
let action = 'Cursor'
let link = { 'starting': undefined, 'ending': undefined }

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

btn_set_initial.addEventListener('click', () => handleSetStatus('initial'))
btn_set_final.addEventListener('click', () => handleSetStatus('final'))

/* Functions to check if an state's context menu is visible and
 * hide the default context menu or hide the personalized */
window.addEventListener('click', () => {
  if (box_contextmenu.className === 'visible')
    box_contextmenu.className = 'hidden'
})
window.addEventListener('contextmenu', e => {
  if (box_contextmenu.className === 'visible')
    e.preventDefault()
})