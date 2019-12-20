const bigDecimal = require('js-big-decimal');

function buildAliasTable(itemsArray) {
    // if(self.isEmpty(itemsArray)) {
    //     console.log('empty table');
    //     return [];
    // }

    const items = [];
    let range = 0;
    for(const i of itemsArray) {
        if(!i.hasOwnProperty('weight') || Number.isNaN(Number(i.weight))) {
            console.log("invalid item weight ", i);
            return;
        }
        //cloning because table generation changes the items' weights
        //item = self.clone(i);
        const item = i;
        range += item.weight;
        item.weight = new bigDecimal(item.weight);
        items.push(item);
    }
    const avg = new bigDecimal(range/items.length);
    console.log('range ',range);

    const worklistSmall = [];
    const worklistLarge = [];

    for(const item of items) {
        if (item.weight.compareTo(avg) < 1) {
            worklistSmall.push(item);
        } else {
            worklistLarge.push(item);
        }
    }

    const aliasTable = [];
    for(let i = 0; i<items.length; i++) {
        if(worklistSmall.length > 0 && worklistLarge.length > 0) {
            const s = worklistSmall.pop();

            if (s.weight.compareTo(avg) === 0) {
                //if we need each item's original weight, we can set it here
                aliasTable.push({p:1, s:s});
                continue;
            }
            const l = worklistLarge.pop();

            //need to find a way to deal with this line. Avg could be a dec number and arithmetic  on this can be imprecise
            const shortage = avg.subtract(s.weight);
            l.weight = l.weight.subtract(shortage);
            const p = s.weight.divide(avg);
            aliasTable.push({p:p.getValue(), s:s, l:l});

            if(l.weight.compareTo(avg) < 1) {
                worklistSmall.push(l);
            } else {
                worklistLarge.push(l);
            }
            continue;
        }

        if(worklistSmall.length > 0) {
            const s = worklistSmall.pop();
            aliasTable.push({p:1, s:s});
            continue;
        }

        if(worklistLarge.length > 0) {
            console.log('precision error building Alias table');
            const l = worklistLarge.pop();
            aliasTable.push({p:1, s:l});
        }
    }
    return aliasTable;
}

function pickFromAliasTable(aliasTable, random) {
    // if (self.isEmpty(aliasTable)) {
    //     console.log('empty table');
    //     return;
    //}
    const index = Math.floor(Math.random() * aliasTable.length);
    const column = aliasTable[index];

    if(column.p === 1) {
        return column.s;
    }

    const pick = Math.random();
    const r = Math.floor(pick*100);
    random[r] = random[r] || 0;
    random[r]++;

    if(pick < column.p) {
        return column.s;
    }
    return column.l;
}

//////////////////////////////////////////////////////////
function generateRandomSet(size) {
    let set = [];
    for(let i=0; i<size; i++) {
        let weight = Math.ceil((Math.random()-1)*-100);
        set.push({id:i, weight:weight});
    }
    return set;
}

function main() {
    for(let i = 100; i < 101; i += 5) {
        console.log(i);
        const set = generateRandomSet(i);
        console.log(set);
        const alias = buildAliasTable(set);
        console.log(alias);
        console.log("alias.length ",alias.length);

        const picked = {};
        const randomCount = {};
        for(let j=0; j<1000000; j++) {
            const t0 = process.hrtime();
            const item = pickFromAliasTable(alias, randomCount);
            const t1 = process.hrtime(t0);
            if (item == null) {
                console.log('oh no');
            }
            picked[item.id] = picked[item.id] || 0;
            picked[item.id]++;
        }

        console.log("item dist ", picked);
        console.log("randomDist ",randomCount);
    }
}

main();
