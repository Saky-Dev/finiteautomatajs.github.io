/* This is an object that saves functions linked to actions
 * that user can do with an state */
const statesVisualData = () => {
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
  return {position, vector}
}
const drawDiagonalPath = (svg, path) => {
  const {position, vector} = statesVisualData()
  const direction = {
    vertical: position.sty < position.edy ? 'down' : 'up',
    horizontal: position.stx < position.edx ? 'right' : 'left'
  }
  const path_data = {
    m: `${direction.horizontal === 'right' ? '0' : vector.width} ${direction.vertical === 'down' ? '0' : vector.height}`,
    c: [
      `${direction.horizontal === 'right' ? '0' : vector.width} ${direction.vertical === 'down' ? '0' : vector.height}`,
      `${direction.horizontal === 'right' ? vector.width : '0'} ${direction.vertical === 'down' ? vector.height : '0'}`,
      `${direction.horizontal === 'right' ? vector.width : '0'} ${direction.vertical === 'down' ? vector.height : '0'}`
    ]
  }

  svg.classList.add('link')

  svg.style.top = `${vector.top}px`
  svg.style.left = `${vector.left}px`
  svg.style.height = `${vector.height}px`
  svg.style.width = `${vector.width}px`

  svg.setAttribute('viewbox', `0 0 ${vector.width} ${vector.height}`)
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  path.setAttributeNS(null, 'd', `M ${path_data.m} C ${path_data.c[0]}, ${path_data.c[1]}, ${path_data.c[2]}`)

  svg.appendChild(path)
  box_drag.appendChild(svg)
}

const drawLinearPath = (svg, path, side) => {
  const {position, vector} = statesVisualData()
  const direction = {
    vertical: position.sty < position.edy ? 'down' : 'up',
    horizontal: position.stx < position.edx ? 'right' : 'left'
  }

  let path_data = undefined

  svg.classList.add('link')

  svg.style.top = `${vector.top}px`
  svg.style.left = `${vector.left}px`

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  if (side === 'horizontal') {
    path_data = {
      m: `${direction.horizontal === 'right' ? '0' : vector.width} 0`,
      l: `${direction.horizontal === 'left' ? '0' : vector.width} 0`
    }

    svg.style.height = `1px`
    svg.style.width = `${vector.width}px`

    svg.setAttribute('viewbox', `0 0 ${vector.width} 1`)

  } else {
    path_data = {
      m: `0 ${direction.vertical === 'down' ? '0' : vector.height}`,
      l: `0 ${direction.vertical === 'up' ? '0' : vector.height}`
    }

    svg.style.height = `${vector.height}px`
    svg.style.width = `1px`

    svg.setAttribute('viewbox', `0 0 1 ${vector.height}`)
  }

  path.setAttributeNS(null, 'd', `M ${path_data.m} L ${path_data.l}`)
  svg.appendChild(path)
  box_drag.appendChild(svg)
}

const drawCyclePath = (svg, path) => {
  const {position, vector} = statesVisualData()
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  const link_container = document.createElement('div')

  link_container.className = 'link_container circle'

  link_container.style.top = `${vector.top - 60}px`
  link_container.style.left = `${vector.left}px`
  link_container.style.height = `60px`
  link_container.style.width = `60px`

  svg.classList.add('link')

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('viewbox', `0 0 60 60`)

  circle.setAttributeNS(null, 'cx', '30')
  circle.setAttributeNS(null, 'cy', '30')
  circle.setAttributeNS(null, 'r', '29.5')
  svg.appendChild(circle)

  link_container.appendChild(svg)
  box_drag.appendChild(link_container)
}

const stateTools = {
  /* Prevent an console error alert */
  'handleCursor': e => e.preventDefault(),
  'handleLink': e => {
    if (!link.starting) {
      link.starting = e.target
      return false
    }

    link.ending = e.target
    
    const position = statesVisualData().position
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const path = document.createElementNS('http://www.w3.org/2000/svg','path')

    let name = undefined

    while(!name) {
      name = prompt('Nombre de la transición (solo 1 caracter):')

      if (name.length > 1)
        name = undefined

      if (name === '' || name === ' ')
        name = 'λ'
    }

    svg.setAttribute('key', `${link.starting.innerText}${name}${link.ending.innerText}`)

    link.starting.innerText === link.ending.innerText ? drawCyclePath(svg, path)
    : position.stx === position.edx ? drawLinearPath(svg, path, 'vertical')
    : position.sty === position.edy ? drawLinearPath(svg, path, 'horizontal')
    : drawDiagonalPath(svg, path)

    states[link.starting.innerText].transitions[name] = link.ending.innerText

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
  node.addEventListener('dragstart', evt => action === 'Cursor' ? stateTools['handleDragstart'](evt) : false)
  node.addEventListener('dragend', evt => action === 'Cursor' ? stateTools['handleDragend'](evt) : false)
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