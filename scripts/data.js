/* Function to add a input data row to box_data
 * the DOM element in EMMET format is euals to 
 * div.row>(input.word+span.result)
 */
const handleDataAdd = () => {
  const row = document.createElement('div')
  const word = document.createElement('input')
  const result = document.createElement('span')
  
  result.className = 'result'

  word.type = 'text'
  word.className = 'word'

  row.className = 'row'
  row.appendChild(word)
  row.appendChild(result)

  box_data.appendChild(row)
}

/* Function remove all children elements inside box_data */
const handleDataClear = () => [...box_data.children].forEach(child => box_data.removeChild(child))

/* Function to get Transition table from states object
 * at first we get all the transitions without repeat the
 * elements and then they are add to trans_table like an
 * arry, then push an array with the state name and
 * each transition result, and finally the table is returned */
const getTransitionTable = (automata_selected) => {
  let transition_table = [[...getAllTransitions(automata_selected)]]

  Object.entries(automata_selected).forEach(([state_id, state]) => {
    transition_table.push([state_id].concat(
      transition_table[0].map(id => state.transitions[id] ? `${[...state.transitions[id]].join()}` : '')
    ))
  })

  transition_table[0].unshift('')

  return transition_table
}

/* Here the function create the graphic UI
 * of the transition table inside hidden window
 * for each element inside the matrix is created
 * a div element that works like a row
 * and an span that works like a column */
const handleTransitionTable = (_e, place, automata_selected) => {
  if (!automata_selected && !isAnAutomata())
    return false

  const automata = automata_selected ?? states
  const transition_table = getTransitionTable(automata)
  const where = place ?? box_transition_table

  transition_table.forEach((row, ri) => {
    const tt_row = document.createElement('div')
    tt_row.className = 'tt_row'

    row.forEach((column, ci) => {
      const tt_column = document.createElement('span')

      tt_column.innerHTML = `${column}`
      tt_column.className = `tt_column${ri > 0 && ci === 0 && automata[column].isInitial ? ' initial' : ''}`

      tt_row.appendChild(tt_column)
    })

    where.appendChild(tt_row)
  })

  if (!automata_selected)
    box_hidden_window.className = 'hidden_window visible'
}

/* This function close the hidden window element and remove
 * all children inside the transition table container */
const handleCloseWindow = () => {
  box_hidden_window.className = 'hidden_window hidden'

  ;[...box_transition_table.children].forEach(child => box_transition_table.removeChild(child))
}

const handleSave = () => {
  if (!isAnAutomata())
    return

  const ls = window.localStorage
  const regex = /^[a-zA-Z0-9_]+$/

  let automatas = {}
  let toSave = JSON.parse(JSON.stringify(states))
  let name = prompt('Nombre de guardado (Solo letras, numeros y giones bajos)')

  if (name === null)
    return

  if (!regex.test(name))
    return alert('Nombre no valido')

  Object.entries(toSave).forEach(([state_id, state]) => {
    state.transitions = {...states[state_id].transitions}

    Object.entries(state.transitions).forEach(([transition_id, transition]) => state.transitions[transition_id] = [...transition])
  })

  console.log(toSave)

  if (ls.getItem('automatas'))
    automatas = JSON.parse(ls.getItem('automatas'))

  if (automatas[name])
    return alert('Este automata ya existe')
  else
    automatas[name] = toSave

  try {
    ls.setItem('automatas', JSON.stringify(automatas))
    alert('Guardado de forma correcta')
  } catch (e) {
    alert('Error al guardar')
  }
}

const getSelectedSavedAutomata = () => {
  const ls = window.localStorage
  const automatas = JSON.parse(ls.getItem('automatas'))
  
  let selected = {...automatas[saved_selected]}

  Object.entries(selected).forEach(([state_id, state]) => {
    Object.entries(state.transitions).forEach(([transition_id, transition]) => {
      selected[state_id].transitions[transition_id] = new Set(transition)
    })
  })

  return selected
}

const handlePreview = e => {
  saved_selected = e.target.getAttribute('key')

  ;[...box_saved_transition_table.children].forEach(child => box_saved_transition_table.removeChild(child))

  handleTransitionTable(e, box_saved_transition_table, getSelectedSavedAutomata())
  
  button_remove_saved.className = 'visible'
  button_graphic_saved.className = 'visible'


  if (box_automatas.querySelector('button.automata_saved.selected'))
    box_automatas.querySelector('button.automata_saved.selected').classList.remove('selected')

  e.target.classList.add('selected')
}

const handleSaved = () => {
  const ls = window.localStorage

  if (!ls.getItem('automatas'))
    return alert('No tienes ningun automata guardado')
  
  const automatas = JSON.parse(ls.getItem('automatas'))

  Object.keys(automatas).forEach(key => {
    const button = document.createElement('button')
    button.className = 'automata_saved'
    button.innerHTML = key
    button.setAttribute('key', key)

    button.addEventListener('click', handlePreview)

    box_automatas.appendChild(button)
  })
  
  box_hidden_saved.className = 'hidden_saved visible'
}

const handleCloseSaved = () => {
  box_hidden_saved.className = 'hidden_saved hidden'

  ;[...box_automatas.children].forEach(child => box_automatas.removeChild(child))
  ;[...box_saved_transition_table.children].forEach(child => box_saved_transition_table.removeChild(child))

  button_remove_saved.className = 'hidden'
  button_graphic_saved.className = 'hidden'
}

const handleRemoveSaved = () => {
  const ls = window.localStorage
  const automatas = JSON.parse(ls.getItem('automatas'))

  delete automatas[saved_selected]
  
  try {
    if (Object.keys(automatas).length < 1) {
      ls.removeItem('automatas')
      handleCloseSaved()
      alert('No tienes ningun automata guardado')
    } else {
      ls.setItem('automatas', JSON.stringify(automatas))
      box_automatas.removeChild(box_automatas.querySelector(`button.automata_saved[key="${saved_selected}"]`))
      ;[...box_saved_transition_table.children].forEach(child => box_saved_transition_table.removeChild(child))
      alert('Automata eliminado de forma correcta')
    }
  } catch (e) {
    alert('Error al eliminar')
  }

  saved_selected = ''
}

const handleGraphicSaved = () => {
  let move = draggable.min_x + 100

  states = getSelectedSavedAutomata()

  handleCloseSaved()

  ;[...document.querySelectorAll('button.state, svg.link, span.pointer')]
  .forEach(child => box_drag.removeChild(child))

  Object.entries(states).forEach(([state_id, state], index) => {
    handleAdd({
      x: move,
      y: index % 2 === 0 ? draggable.max_y - 100 : draggable.min_y + 100
    }, state_id, state.label, true)
    move += index % 2 === 0 ? 200 : 0
  })

  document.querySelector(`button.state[key='${Object.entries(states).find(([,state]) => state.isInitial)[0]}']`)
  .classList.add('initial')

  Object.entries(states)
  .filter(([,state]) => state.isFinal)
  .forEach(([state_id,]) => document.querySelector(`button.state[key='${state_id}']`).classList.add('final'))

  Object.entries(states).forEach(([state_id, state]) => {
    Object.entries(state.transitions).forEach(([transition_id, transition]) =>  {
      ;[...transition].forEach(goal => {
        link.starting = document.querySelector(`button.state[key='${state_id}']`)
        link.ending = document.querySelector(`button.state[key='${goal}']`)
        stateTools.handleLink(link.ending, transition_id, true)
      })
    })
  })

  state_num = 0
  wasConverted = false
}

/* DOM elements */
const box_data = document.querySelector('main div.input_data div.data')
const box_hidden_window = document.querySelector('main div.hidden_window')
const box_hidden_saved = document.querySelector('main div.hidden_saved')
const box_transition_table = document.querySelector('main div.hidden_window div.transition_table')
const box_automatas = document.querySelector('main div.hidden_saved div.automatas')
const box_saved_transition_table = document.querySelector('main div.hidden_saved div.preview div.transition_table')
const button_remove_saved = document.querySelector('main div.hidden_saved div.preview button#remove_saved')
const button_graphic_saved = document.querySelector('main div.hidden_saved div.preview button#graphic_saved')

let saved_selected = ''

/* Action buttons */
document.querySelector('button#data_add').addEventListener('click', handleDataAdd)
document.querySelector('button#data_clear').addEventListener('click', handleDataClear)
document.querySelector('button#table').addEventListener('click', handleTransitionTable)
document.querySelector('button#save').addEventListener('click', handleSave)
document.querySelector('button#saved').addEventListener('click', handleSaved)
document.querySelector('button.close_window').addEventListener('click', handleCloseWindow)
document.querySelector('button.close_saved').addEventListener('click', handleCloseSaved)

button_remove_saved.addEventListener('click', handleRemoveSaved)
button_graphic_saved.addEventListener('click', handleGraphicSaved)