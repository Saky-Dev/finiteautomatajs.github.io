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
const getTransitionTable = () => {
  let transition_table = [[...getAllTransitions()]]

  Object.entries(states).forEach(([state_id, state]) => {
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
const handleTransTable = () => {
  if (!isAnAutomata())
    return false

  const transition_table = getTransitionTable()

  transition_table.forEach((row, ri) => {
    const tt_row = document.createElement('div')
    tt_row.className = 'tt_row'

    row.forEach((column, ci) => {
      const tt_column = document.createElement('span')

      tt_column.innerHTML = `${column}`
      tt_column.className = `tt_column${ri > 0 && ci === 0 && states[column].isInitial ? ' initial' : ''}`

      tt_row.appendChild(tt_column)
    })

    box_transition_table.appendChild(tt_row)
  })
  
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

/* DOM elements */
const box_data = document.querySelector('main div.input_data div.data')
const box_hidden_window = document.querySelector('main div.hidden_window')
const box_transition_table = document.querySelector('main div.hidden_window div.transition_table')

/* Action buttons */
document.querySelector('button#data_add').addEventListener('click', handleDataAdd)
document.querySelector('button#data_clear').addEventListener('click', handleDataClear)
document.querySelector('button#table').addEventListener('click', handleTransTable)
document.querySelector('button#save').addEventListener('click', handleSave)
document.querySelector('button.close_window').addEventListener('click', handleCloseWindow)