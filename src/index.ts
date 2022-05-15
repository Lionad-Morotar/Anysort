import anysort from './main'

// const gangs = [
//   {
//     name: 'A',
//     age: 33,
//     badRecord: []
//   },
//   {
//     name: 'B',
//     age: 25,
//     badRecord: ['X001']
//   },
//   {
//     name: 'C',
//     age: 25,
//     badRecord: ['X888', 'X772']
//   },
//   {
//     name: 'D',
//     age: 25,
//     badRecord: []
//   },
//   {
//     name: 'E',
//     age: 33,
//     badRecord: ['X888', 'X772', 'X002']
//   }
// ]

// anysort(gangs, 'badRecords.length-reverse()')
// anysort(gangs, 'badRecord.length-reverse()')

// anysort(gangs).aga.reverse()
// anysort(gangs).age.reverse()

export type Anysort = typeof anysort
export default anysort as Anysort
