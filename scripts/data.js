/* function to add a input data row to box_data
 * the DOM element in EMMET format is euals to 
 * div.row>(input.word+span.result)
 */
document.querySelector('button#data_add').addEventListener('click', () => {
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
})

/* function remove all children elements inside box_data */
document.querySelector('button#data_clear').addEventListener('click', () => 
  [...box_data.children].forEach(child => box_data.removeChild(child))
)

/* DOM elements */
const box_data = document.querySelector('main div.input_data div.data')