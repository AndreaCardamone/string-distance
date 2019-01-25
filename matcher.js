const matcher = require('string-similarity');

function normalize(string) {
  return string.toLowerCase()
    .replace(/_|-/g, ' ')
    .replace(/percentuale/, '%')
    .replace(/percentage/, '%')
}

function matchs({
  sources = [],
  targets = [],
  threshold = 0.5,
  log = false,
  source_getter = source => source,
  target_getter = target => target,
  match_callback = ({ source, target, score }) => undefined,
}
) {
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

      if (score >= threshold && score > best.score) {
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

  if (log) {
    console.table(table)
  }

  return bests
}

function match(options) {
  options.sources = [options.source]
  return Object.values(matchs(options))[0]
}

function is_matched(source = '', target = '', threshold = 0.5) {
  let targets = Array.isArray(target)? target : [target]

  return match({source, targets, threshold}) !== undefined
}

exports.match = match
exports.matchs = matchs
exports.isMatched = is_matched
exports.is_matched = is_matched