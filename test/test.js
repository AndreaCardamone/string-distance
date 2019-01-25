const { readFileSync } = require('fs')
const { match, matchs } = require('string-similarity-match')


function test1() {
  let sources = ["foobar"]
  let targets = ["toobar", "foo-bar", "barfoo"]
  
  let m = matchs({sources, targets})
  
  console.log(`the match of "${source}" from "[${targets.join(', ')}] is ${m}`);
}


function test2() {
  let targets = JSON.parse(readFileSync('./sources.json', 'utf8'))
  let sources = [
    {value: `"ELEONORE O' KON" <stephen91@gmail.com>`},
    {value: `Chaim Bogan<Gregoria_McKenzie@yahoo.com>`}
  ]

  m = matchs({
    sources, targets,
    log: true,
    source_getter: d => d.value,
    target_getter: d => `${d.firstname} ${d.lastname} ${d.email}`,
    threshold: 0.7,
    match_callback: ({ source, target, score }) => source.score = score,
  })

  console.log(sources);

}


test1()
test2()