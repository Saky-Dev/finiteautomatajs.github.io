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
 * arry, the we add to anonymous array the state name and
 * each transition result, finally for each element inside
 * the matrix is created a div element that works like a row
 * and a span that works like a column */
const handleTransTable = () => {
  const hasInitial = Object.values(states).findIndex(state => state.isInitial) < 0 ? false : true
  const hasFinal = Object.values(states).findIndex(state => state.isFinal) < 0 ? false : true
  const states_ids = Object.keys(states)

  let trans_table = []
  let transitions = new Set()

  states_ids.forEach(id => {
    Object.keys(states[id].transitions).forEach(trans => transitions.add(trans))
  })

  trans_table.push([...transitions])

  states_ids.forEach(id => {
    let anonymous = []
    anonymous.push(id)

    transitions.forEach(trans => anonymous.push(
        states[id].transitions[trans]
        ? `${[...states[id].transitions[trans]].map(res => res)}`
        : ''
      )
    )

    trans_table.push(anonymous)
  })

  if (trans_table[0].length < 1)
    return alert('Debes de tener minimo dos estados y una transición')

  if (!hasInitial || !hasFinal)
    return alert('Debes definir un inirio y un final')

  trans_table[0].unshift('')

  trans_table.forEach((row, ri) => {
    const tt_row = document.createElement('div')
    tt_row.className = 'tt_row'

    row.forEach((column, ci) => {
      const tt_column = document.createElement('span')

      tt_column.innerHTML = `${column}`
      tt_column.className = `tt_column${ri > 0 && ci === 0 && states[column].isInitial ? ' initial' : ''}`

      tt_row.appendChild(tt_column)
    })

    box_trans_table.appendChild(tt_row)
  })
  
  box_hidden_window.className = 'hidden_window visible'
}

/* This function close the hidden window element and remove all children inside
 * the transition table container */
const handleCloseWindow = () => {
  box_hidden_window.className = 'hidden_window hidden'

  ;[...box_trans_table.children].forEach(child => box_trans_table.removeChild(child))
}

/* DOM elements */
const box_data = document.querySelector('main div.input_data div.data')
const box_hidden_window = document.querySelector('main div.hidden_window')
const box_trans_table = document.querySelector('main div.hidden_window div.trans_table')

/* Action buttons */
document.querySelector('button#data_add').addEventListener('click', handleDataAdd)
document.querySelector('button#data_clear').addEventListener('click', handleDataClear)
document.querySelector('button#table').addEventListener('click', handleTransTable)
document.querySelector('button.close_window').addEventListener('click', handleCloseWindow)