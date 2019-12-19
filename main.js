function generateRandomSet(size) {
    let set = [];
    let sum = 0;
    for(let i=0; i<size; i++) {
        let prob = Math.random();
        set.push({id:i, p:prob});
        sum += prob;
    }
    set = _scaleSetProbability(set, sum);
    return set;
}

function _scaleSetProbability(set, sum) {
    return set.map(function(x) {
        x.p = (x.p * set.length)/sum;
        return x;
    });
}

function generateAliasTable(set) {
    let small = [];
    let big = [];

    for(const item of set) {
        if (item.p <= 1) {
            small.push(item);
        } else {
            big.push(item);
        }
    }

    let table = [];
    for (let i = 0; i < set.length; i++) {
        if (small.length > 0 && big.length > 0) {
            let s = small.pop();
            let b = big.pop();
            b.p = b.p + s.p - 1;
            if(b.p <= 1) {
                small.push(b);
            } else {
                big.push(b);
            }
            table[i] = {p:s.p, s:s.id, b:b.id};
            continue;
        }

        if (small.length > 0) {
            let s = small.pop();
            table[i] = {p:1, s:s.id};
            continue;
        }

        if (big.length > 0) {
            let b = big.pop();
            table[i] = {p:0, b:b};
            continue;
        }
    }
    return table;
}

function lookupAliasTable(table) {
    const column = Math.floor(Math.random() * table.length);
    if (table[column].p < Math.random()) {
        return table[column].s;
    }
    return table[column].b;
}

function lookUpStandard(set) {
    const pick = Math.random() * set.length;
    let accumulation = 0;
    for (let i = 0; i < set.length; i++) {
        accumulation += set[i].p;
        if (accumulation > pick) {
            return set[i];
        }
    }
    console.log('range error');
}

function main() {
    for(let i = 10; i < 10000; i += 10) {
        for(let j = 0; j< 10; j++) {
            const randomSet = generateRandomSet(i);

            const t0 = process.hrtime();
            lookUpStandard(randomSet);
            const t1 = process.hrtime(t0);

            const aliasTable = generateAliasTable(randomSet);

            const t2 = process.hrtime();
            lookupAliasTable(aliasTable);
            const t3 = process.hrtime(t2);

            console.log(i, t1, t3);

        }
    }
}

main();