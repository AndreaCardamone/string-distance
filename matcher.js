const matcher = require('string-similarity');

//TODO: make normalize function as paramter
function normalize(string) {
  return string.toLowerCase()
    .replace(/_|-/g, ' ')
    .replace(/percentuale/, '%')
    .replace(/percentage/, '%')
}
/**
 * Perform a search match based on <a href="https://www.npmjs.com/package/string-similarity">string-similarity</a>
 * 
 * @version 0.0.1
 * @since 0.0.1
 * @todo Adding a "normalize" function as options
 * 
 * @example
 * let sources = ["foobar", "test"];
 * let targets = ["toobar", "foo-bar", "barfoo", "test", "fest", "cest"];
 * let m = matchs({ sources, targets });
 * 
 * // the match of "[foobar, test]" from "[toobar, foo-bar, barfoo, test, fest, cest] is {"foobar":"foo-bar","test":"test"}
 * console.log(`the match of "${source}" from "[${targets.join(', ')}] is ${m}`);
 * 
 * @example
 * let targets = JSON.parse(readFileSync('./sources.json', 'utf8'))
 * let sources = [
 *   {value: `"ELEONORE O' KON" <stephen91@gmail.com>`},
 *   {value: `Chaim Bogan<Gregoria_McKenzie@yahoo.com>`}
 * ]
 *
 * m = matchs({
 *   sources, targets,
 *   log: true,
 *   source_getter: d => d.value,
 *   target_getter: d => `${d.firstname} ${d.lastname} ${d.email}`,
 *   threshold: 0.7,
 *   match_callback: ({ source, target, score }) => source.score = score,
 * })
 *
 * console.log(sources);
 * 
 * @param {Object} options - The options of matching
 * @param {any[]|Map<Any>|Set<Any>|{values: ()=>Iterable<any>}} options.sources - The source Array, Map, Set or class with values() function in prototype
 * @param {any[]|Map<Any>|Set<Any>|{values: ()=>Iterable<any>}} options.targets - The target Array, Map, Set or class with values() function in prototype
 * @param {number=0.5} options.threshold - The threshold of score for filtering the matches
 * @param {boolean=true} options.debug - The option for enabling debug printing
 * @param {()=>string=obj => obj.toSring()} options.source_getter - The function applied to all sources fo getting the string source value (default: )
 * @param {()=>string=obj => obj.toSring()} options.target_getter - The function applied to all targets fo getting the string target value (default: target => target)
 * @param {(source, target, score)=>any= ()=>undefined} options.match_callback - a callback callad each match founded (default: ({source, target, score}) => undefined)
 * @returns {[key: string]: object} The match results
 */
function matchs({
  sources = [],
  targets = [],
  threshold = 0.5,
  debug = false,
  source_getter = source => source,
  target_getter = target => target,
  match_callback = ({ source, target, score }) => undefined
}
) {
  //TODO improve the sources/targets type checking
  let _sources = Array.isArray(sources) ? sources : [...sources.values()]
  let _targets = Array.isArray(targets) ? targets : [...targets.values()]

  let array = _targets.map(target => {
    return { target, normalized: normalize(target_getter(target)) }
  })


  let bests = {}, table = []
  for (const source of _sources) {
    let best = {
      source: source,
      target: undefined,
      score: -Infinity
    }

    let source_name = source_getter(source);
    let target_name = undefined;
    let normalized = normalize(source_name)

    for (const element of array) {
      let score = matcher.compareTwoStrings(normalized, element.normalized)
      if (score < threshold) continue;

      if (score > best.score) {
        target_name = target_getter(element.target)
        Object.assign(best, { target: element.target, score })
      }
    }

    table.push({
      source: source_name,
      target: target_name,
      score: +best.score.toFixed(2),
    })

    if (best.target) {
      bests[source_name] = best.target
    }

    match_callback(best)
  }

  if (debug) {
    console.table(table)
  }

  return bests
}

function match(options) {
  options.sources = [options.source]
  return Object.values(matchs(options))
}

function is_matched(source = '', target = '', threshold = 0.5) {
  let targets = Array.isArray(target)? target : [target]

  return match({source, targets, threshold}) !== undefined
}

exports.match = match
exports.matchs = matchs
exports.isMatched = is_matched
exports.is_matched = is_matched