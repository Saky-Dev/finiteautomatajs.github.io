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

const handleTransTable = () => {
  let states_ids = Object.keys(states)
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

  trans_table[0].unshift('')
  
  console.table(trans_table)

  box_hidden_window.className = 'hidden_window visible'
}

/* DOM elements */
const box_data = document.querySelector('main div.input_data div.data')
const box_hidden_window = document.querySelector('main div.hidden_window')
const box_trans_table = document.querySelector('main div.hidden_window div.trans_table')

/* Action buttons */
document.querySelector('button#data_add').addEventListener('click', handleDataAdd)
document.querySelector('button#data_clear').addEventListener('click', handleDataClear)
document.querySelector('button#table').addEventListener('click', handleTransTable)