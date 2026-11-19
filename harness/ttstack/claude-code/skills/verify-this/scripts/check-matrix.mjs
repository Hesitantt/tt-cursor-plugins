#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { DIMENSIONS } from './dimensions.mjs'

const HEADER = ['case', 'dimension', 'status', 'artifact', 'note']
const STATUSES = ['PASS', 'FAIL', 'N/A', 'TODO']
const CITATION = /[\w./-]+\.\w+(:\d+)?/
const DRIVEN = ['PASS', 'FAIL']

const file = process.argv[2]
if (!file) {
	console.error('Usage: node check-matrix.mjs <matrix.tsv>')
	process.exit(2)
}

const dir = path.dirname(path.resolve(file))
const problems = []
const fail = (line, message) => problems.push(`${file}:${line}: ${message}`)

let header = null
const rows = []
fs.readFileSync(file, 'utf8')
	.split(/\r?\n/)
	.forEach((text, i) => {
		if (text.trim() === '' || text.startsWith('#')) return
		const cells = text.split('\t').map((c) => c.trim())
		if (!header) {
			header = cells
			if (cells.join('|') !== HEADER.join('|'))
				fail(
					i + 1,
					`header is [${cells.join(', ')}], expected [${HEADER.join(', ')}]`,
				)
			return
		}
		const [name = '', dimension = '', status = '', artifact = '', note = ''] =
			cells
		rows.push({
			n: i + 1,
			name,
			family: dimension.split(':')[0],
			status,
			artifacts: artifact
				.split(',')
				.map((a) => a.trim())
				.filter(Boolean),
			note,
		})
	})

if (!header) fail(1, 'empty matrix')

for (const row of rows) {
	const label = row.name || `row ${row.n}`
	if (!row.name) fail(row.n, 'row names no case')
	if (!DIMENSIONS.includes(row.family))
		fail(
			row.n,
			`${label}: dimension "${row.family}" is not one of ${DIMENSIONS.join(', ')}`,
		)
	if (!STATUSES.includes(row.status))
		fail(
			row.n,
			`${label}: status "${row.status}" is not one of ${STATUSES.join(', ')}`,
		)
	if (row.status === 'TODO') fail(row.n, `${label}: not driven yet`)
	if (row.status === 'FAIL')
		fail(row.n, `${label}: FAIL${row.note ? `, ${row.note}` : ''}`)
	if (DRIVEN.includes(row.status)) {
		if (row.artifacts.length === 0) fail(row.n, `${label}: names no artifact`)
		for (const artifact of row.artifacts) {
			if (!fs.existsSync(path.resolve(dir, artifact)))
				fail(row.n, `${label}: artifact ${artifact} does not exist`)
		}
	}
	if (row.status === 'N/A') {
		if (row.family === 'happy')
			fail(row.n, `${label}: the happy path cannot be N/A`)
		else if (!CITATION.test(row.note))
			fail(row.n, `${label}: N/A note cites no file`)
	}
}

for (const dimension of DIMENSIONS) {
	const own = rows.filter((r) => r.family === dimension)
	if (own.length === 0) {
		fail(1, `no ${dimension} row`)
		continue
	}
	const na = own.some((r) => r.status === 'N/A')
	const driven = own.some((r) => DRIVEN.includes(r.status))
	if (na && driven) fail(own[0].n, `${dimension} is both N/A and driven`)
}

const drivenBeyondHappy = rows.filter(
	(r) => r.family !== 'happy' && DRIVEN.includes(r.status),
)
if (rows.length && drivenBeyondHappy.length === 0)
	fail(1, 'only the happy path is driven')

const count = (status) => rows.filter((r) => r.status === status).length
const drivenDimensions = new Set(
	rows.filter((r) => DRIVEN.includes(r.status)).map((r) => r.family),
)
console.log(
	`coverage: ${count('PASS')} of ${rows.length} rows PASS, ${count('N/A')} N/A, ${count('FAIL')} FAIL, ${count('TODO')} TODO, ${drivenDimensions.size} of ${DIMENSIONS.length} dimensions driven`,
)
for (const p of problems) console.error(p)
process.exit(problems.length ? 1 : 0)
