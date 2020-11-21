// https://observablehq.com/@vpatryshev/finger-trees-in-js@3575
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["html"], function(html){return(
html`<style>
  .h1 { font-size: 4em; }
  .h2 { font-size: 3em; }
  .h3 { font-size: 2em; }
  .h4 { font-size: 1.5em; }
</style>
<h1 align=center class=h1>Finger Trees in JS</h1>
<h2 align=center class=h2>Vlad Patryshev</h2>
<h3 align=center class=h3>Scale by the Bay</h3>
<h4 align=center class=h4>2020</h4>
<p align=center><a href='https://observablehq.com/@vpatryshev/finger-trees-in-js'>https://observablehq.com/@vpatryshev/finger-trees-in-js</a></p>
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
A magically efficient data structure.
"Constant" time for important operations.
Especially efficient if keys are values of an [ordered monoid](https://en.wikipedia.org/wiki/Ordered_semigroup).

But first, let's study the actual trees.

<img src="https://github.com/vpatryshev/fingertree_js/raw/main/fig1.png">\
([source](https://www.pubs.ext.vt.edu/430/430-456/430-456.html))

Below is a simplistic Haskell representation of the structure.

A finger tree can be empty, contain a single value (leaf), or contain a leader with some laterals left and right.
Unlike in a regular tree, leader is also a finger tree, but its leaves are called nodes, and a note is either a tuple or a triple.

Traditionally, programmers draw trees as if they grow from top to bottom, like in Australia. 
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`

\`\`\`haskell
data FingerTree a = Empty
                  | Single a
                  | Deep (Digit a) (FingerTree (Node a)) (Digit a)

data Digit a = One a | Two a a | Three a a a | Four a a a a

data Node a = Node2 a a | Node3 a a a
\`\`\`
`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<img src="https://github.com/vpatryshev/fingertree_js/raw/main/fig2.png"/><br/>
<img src="https://github.com/vpatryshev/fingertree_js/raw/main/fig3.png"/><br/>
<img src="https://github.com/vpatryshev/fingertree_js/raw/main/fig4.png" width=300/><br/>
<h3>Now look how it works:</h3>
<img src="https://github.com/vpatryshev/fingertree_js/raw/main/fig5.gif"/><br/>

`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
## (Amortized) Performance Comparison: O of...
| *Operation* | *Finger Tree* | *2-3 Tree* | *List* | *Vector* | *HashTable* |
|:------------|--------------:|-----------:|-------:|---------:|------------:|
| cons        | 1             | log n      | 1      | n | log n |
| snoc        | 1             | log n      | n      | n | log n |
| access      | log n         | log n      | n      | 1 | n/a | 
| search      | log n         | log n      | n      | n | log n |
| insert      | log n         | log n      | n      | log n | log n |
| delete      | log n         | log n      | n      | log n | log n |
| concat      | log min(size1, size2) | log n     | n      | n+m | log(n+m) (varies) |
| split       | log min(n, size - n) | log n | n    | 1 | n/a |
| split by measure | 1 | log n | log n | log n | n/a | 
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
<hr/><br/><br/>
## Performance Improves By...
### ...ordering values, by their measure

### What is measure?
_Ordered Monoid_
_(0, +, <)_

### E.g.
- size (0, +, <)
- priority (-∞, max, <)
- strings ("", ◠ , ≺)
- price


But first, start with simple things, in a simple language, JavaScript.
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
<br/><br/><br/><br/>
### Recapping, what data do we have:

\`\`\`haskell
data FingerTree a = Empty
                  | Single a
                  | Deep (Digit a) (FingerTree (Node a)) (Digit a)

data Digit a = One a | Two a a | Three a a a | Four a a a a

data Node a = Node2 a a | Node3 a a a
\`\`\`
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`
### Expressing it in JavaScript (a special kind of JavaScript, learned from the [SICP in JS book](https://source-academy.github.io/sicp/))
`
)});
  main.variable(observer("prototype_of_finger_tree")).define("prototype_of_finger_tree", function()
{
  return {
    empty: {},                          // empty tree
    single: v1 => {},                   // tree with single value
    tree: (left, subtree, right) => {}, // Full tree

    digit1: v1 => {},                   // one value
    digit2: (v1,v2) => {},              // two values
    digit3: (v1,v2,v3) => {},           // three values
    digit4: (v1,v2,v3,v4) => {},        // four values

    node2: (v1, v2) => {},              // node with two values
    node3: (v1, v2, v3) => {}           // node with three values
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<hr/><br/><br/><br/><br/>
## Ok, how about some functionality?`
)});
  main.variable(observer("FingerTree0")).define("FingerTree0", function()
{
  return {
    empty:                          ({toString: () => "<>"}),
    single: a          =>           ({toString: () => `single(${a})`}),                       // tree with single value
    tree: (left, subtree, right) => ({toString: () => `tree(${left},${subtree},${right})`}),  // Full tree

    digit1: a         =>            ({toString: () => `[${a}]`}),                             // 1 leaf
    digit2: (a,b)     =>            ({toString: () => `[${a},${b}]`}),                        // 2 leaves
    digit3: (a,b,c)   =>            ({toString: () => `[${a},${b},${c}]`}),                   // 3 leaves
    digit4: (a,b,c,d) =>            ({toString: () => `[${a},${b},${c},${d}]`}),              // 4 leaves

    node2: (a,b)      =>            ({toString: () => `node(${a},${b})`}),                    // two branches
    node3: (a,b,c)    =>            ({toString: () => `node(${a},${b},${c})`})                // three branches
  }
}
);
  main.variable(observer()).define(["FingerTree0"], function(FingerTree0)
{
  const ft = FingerTree0;
  return ft.tree(ft.digit2(11,12),ft.single(20), ft.digit1(30)) + '\n' +
         ft.tree(ft.digit3('a', 'b', 'c'),
                ft.tree(ft.digit1(ft.node2('d','e')),
                        ft.single(ft.node3('f','g','h')),
                        ft.digit2(ft.node2('i','j'),ft.node3('k','l','m'))),
                ft.digit1('n'))
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/><br/><br/><br/><hr/>
### Now implement an operation, \`cons\`
`
)});
  main.variable(observer("FingerTreeWithCons")).define("FingerTreeWithCons", ["FingerTree0"], function(FingerTree0)
{
  var digit1, digit2, digit3, digit4, empty, single, tree;
  const node2 = FingerTree0.node2;
  const node3 = FingerTree0.node3;
  
  single = a => ({
    toString: () => `single(${a})`,
    cons: b      => tree(digit1(b), empty, digit1(a))
  });

  empty = {toString: () => "<>", cons: single};

  tree = (left, subtree, right) => ({
    toString: () => `tree(${left},${subtree},${right})`,
    cons: a      => left.cons(a)(subtree, right)
  });

  digit1 = a => ({
    toString: () => `[${a}]`,
    cons: b      => (subtree, right) => tree(digit2(b,a), subtree, right)
  });
  
  digit2 = (a,b) => ({
    toString: () => `[${a},${b}]`,
    cons: c      => (subtree, right) => tree(digit3(c,a,b), subtree, right)
  });

  digit3 = (a,b,c) => ({
    toString: () => `[${a},${b},${c}]`,
    cons: d      => (subtree, right) => tree(digit4(d,a,b,c), subtree, right)
  });

  digit4 = (a,b,c,d) => ({
    toString: () => `[${a},${b},${c},${d}]`,
    cons: e      => (subtree, right) => tree(digit2(e,a), subtree.cons(node3(b,c,d)), right)
  });
  
  return {
    empty:  empty,
    single: single,
    tree:   tree,
    digit1: digit1,
    digit2: digit2,
    digit3: digit3,
    digit4: digit4,
    node2:  node2,
    node3:  node3,
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/><br/><br/><br/>
### See how it grows when we add values on the left`
)});
  main.variable(observer()).define(["FingerTreeWithCons","Promises"], function*(FingerTreeWithCons,Promises)
{
  const ft = FingerTreeWithCons;
  
  function build(n) {
    return n === 0 ? ft.empty : build(n-1).cons(n);
  }

  for (var i = 0; i < 12; i++) {
    yield Promises.delay(2000, (i > 0? ('\nappending ' + i + ' to ' + build(i-1) + ' =>\n               ') : '') + build(i))
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/><br/><br/><br/>
### Add an implementation of \`snoc\`, that's appending on the right`
)});
  main.variable(observer("FingerTreeWithSnoc")).define("FingerTreeWithSnoc", ["FingerTree0"], function(FingerTree0)
{
  var digit1, digit2, digit3, digit4, empty, single, tree;
  const node2 = FingerTree0.node2;
  const node3 = FingerTree0.node3;

  tree = (left, subtree, right) => ({
    st: subtree,
    toString: () => `tree(${left},${subtree},${right})`,
    snoc: a      => (right.snoc)(a)(left, subtree)
  });
  
  single = a => ({
    toString: () => `single(${a})`,
    snoc: b      => (tree(digit1(a), empty, digit1(b)))
  });
  
  empty = {toString: () => "<>", snoc: single};

  digit1 = a => ({
    toString: () => `[${a}]`,
    snoc: b => (left, subtree) => tree(left, subtree, digit2(a,b))
  });
  
  digit2 = (a,b) => ({
    toString: () => `[${a},${b}]`,
    snoc: c => (left, subtree) => tree(left, subtree, digit3(a,b,c))
  });

  digit3 = (a,b,c) => ({
    toString: () => `[${a},${b},${c}]`,
    snoc: d => (left, subtree) => tree(left, subtree, digit4(a,b,c,d))
  });

  digit4 = (a,b,c,d) => ({
    toString: () => `[${a},${b},${c},${d}]`,
    snoc: e => (left, subtree) => tree(left, subtree.snoc(node3(a,b,c)), digit2(d,e))
  });
  
  return {
    empty: empty,
    single: single,
    tree: tree,
    digit1: digit1,
    digit2: digit2,
    digit3: digit3,
    digit4: digit4,
    node2: FingerTree0.node2,
    node3: FingerTree0.node3,
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/><br/><br/><br/>
### And see how it grows`
)});
  main.variable(observer()).define(["FingerTreeWithSnoc"], function(FingerTreeWithSnoc)
{
  const ft = FingerTreeWithSnoc;
  
  const build = n => n === 0 ? ft.empty : build(n-1).snoc(n);

  var samples = "\n";
  
  for (var i = 0; i < 18; i++) {
    samples += (i > 0? ('snoc ' + i + ': ') : '') + build(i) + "\n";
  }
  return samples;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/><br/><br/><br/>
### With a symmetric structure, it's enough to have a left fold, \`foldl\``
)});
  main.variable(observer("FingerTreeWithFoldl")).define("FingerTreeWithFoldl", function()
{
  const foldl = (op, z) => v => (v.foldl === undefined) ? op(z,v) : v.foldl(op, z);
  
  var digit1, digit2, digit3, digit4, node2, node3, empty, single, tree;
  
  tree = (left, subtree, right) => ({
    st: subtree,
    toString: () => `tree(${left},${subtree},${right})`,
    cons: a => (left.cons)(a)(subtree, right),
    snoc: a => (right.snoc)(a)(left, subtree),
    foldl: function(op,z) {
      let folder = foldl(op, z)
      let leftSum = folder(left)
      let rightSum = folder(right)
      let midSum = folder(subtree)
      return op(op(op(z, leftSum), midSum), rightSum) // expecting associativity of the monoid
    }
  });
  
  single = a => ({
    toString: () => `single(${a})`,
    cons: b => (tree(digit1(b), empty, digit1(a))),
    snoc: b => (tree(digit1(a), empty, digit1(b))),
    foldl: (op,z) => foldl(op,z)(a)
  });
  
  empty = {
    toString: () => "<>",
    cons: single,
    snoc: single,
    foldl: (op,z) => z
  };

  digit1 = a => ({
    toString: () => `[${a}]`,
    cons: b => (subtree, right) => tree(digit2(b,a), subtree, right),
    snoc: b => (left, subtree)  => tree(left, subtree, digit2(a,b)),
    foldl: (op,z) => foldl(op,z)(a)
  });
  
  digit2 = (a,b) => ({
    toString: () => `[${a},${b}]`,
    cons: c => (subtree, right) => tree(digit3(c,a,b), subtree, right),
    snoc: c => (left, subtree) => tree(left, subtree, digit3(a,b,c)),
    foldl: (op,z) => op(foldl(op,z)(a),foldl(op,z)(b))
  });

  digit3 = (a,b,c) => ({
    toString: () => `[${a},${b},${c}]`,
    cons: d => (subtree, right) => tree(digit4(d,a,b,c), subtree, right),
    snoc: d => (left, subtree)  => tree(left, subtree, digit4(a,b,c,d)),
    foldl: (op,z) => op(op(foldl(op,z)(a),foldl(op,z)(b)),foldl(op,z)(c))
  });

  digit4 = (a,b,c,d) => ({
    toString: () => `[${a},${b},${c},${d}]`,
    cons: e => (subtree, right) => tree(digit2(e,a), subtree.cons(node3(b,c,d)), right),
    snoc: e => (left, subtree)  => tree(left, subtree.snoc(node3(a,b,c)), digit2(d,e)),
    foldl: (op,z) => op(op(op(foldl(op,z)(a),foldl(op,z)(b)),foldl(op,z)(c)),foldl(op,z)(d))
  });

  node2 = (a,b) => ({
    toString: () => `node(${a},${b})`,
    foldl: (op,z) => op(op(z,foldl(op,z)(a)),foldl(op,z)(b))
  });
  
  node3 = (a,b,c) => ({
    toString: () => `node(${a},${b},${c})`,
    foldl: (op,z) => op(op(op(z,foldl(op,z)(a)),foldl(op,z)(b)),foldl(op,z)(c))
  })

  return {
    empty: empty,
    single: single,
    tree: tree,
    digit1: digit1,
    digit2: digit2,
    digit3: digit3,
    digit4: digit4,
    node2: node2,
    node3: node3,
  }
}
);
  main.variable(observer()).define(["FingerTreeWithFoldl"], function(FingerTreeWithFoldl)
{
  const ft = FingerTreeWithFoldl;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const build = n => n === 0 ? ft.empty : build(n-1).snoc(chars.charAt(n-1));

  const sample = build(26);

  const sum = sample.foldl((x, y) => (x + '  ' + y).trim(), '');
  
  return sample + '\n\n' + sum;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/><br/><br/><br/>
### To improve performance, let's cache some values, e.g. sizes`
)});
  main.variable(observer("FingerTreeWithSize")).define("FingerTreeWithSize", function()
{
  const foldl = (op, z) => v => (v.foldl === undefined) ? op(z,v) : v.foldl(op, z);
  const size = v => (v.size === undefined) ? 1 : v.size;
  
  var digit1, digit2, digit3, digit4, node2, node3, empty, single, tree;
  
  tree = (left, subtree, right) => ({
    st: subtree,
    toString: () => `tree(${left},${subtree},${right})`,
    cons: a => (left.cons)(a)(subtree, right),
    snoc: a => (right.snoc)(a)(left, subtree),
    foldl: (op,z) => op(op(op(z, foldl(op,z)(left)), foldl(op,z)(subtree)), foldl(op,z)(right)),
    size: size(left) + size(subtree) + size(right)
  });
  
  single = a => ({
    toString: () => `single(${a})`,
    cons: b => (tree(digit1(b), empty, digit1(a))),
    snoc: b => (tree(digit1(a), empty, digit1(b))),
    foldl: (op,z) => foldl(op,z)(a),
    size: size(a)
  });
  
  empty = {
    toString: () => "<>",
    cons: single,
    snoc: single,
    foldl: (op,z) => z,
    size: 0
  };

  digit1 = a => ({
    toString: () => `[${a}]`,
    cons: b => (subtree, right) => tree(digit2(b,a), subtree, right),
    snoc: b => (left, subtree)  => tree(left, subtree, digit2(a,b)),
    foldl: (op,z) => foldl(op,z)(a),
    size: size(a)
  });
  
  digit2 = (a,b) => ({
    toString: () => `[${a},${b}]`,
    cons: c => (subtree, right) => tree(digit3(c,a,b), subtree, right),
    snoc: c => (left, subtree) => tree(left, subtree, digit3(a,b,c)),
    foldl: (op,z) => op(foldl(op,z)(a),foldl(op,z)(b)),
    size: size(a) + size(b)
  });

  digit3 = (a,b,c) => ({
    toString: () => `[${a},${b},${c}]`,
    cons: d => (subtree, right) => tree(digit4(d,a,b,c), subtree, right),
    snoc: d => (left, subtree)  => tree(left, subtree, digit4(a,b,c,d)),
    foldl: (op,z) => op(op(foldl(op,z)(a),foldl(op,z)(b)),foldl(op,z)(c)),
    size: size(a) + size(b) + size(c)
  });

  digit4 = (a,b,c,d) => ({
    toString: () => `[${a},${b},${c},${d}]`,
    cons: e => (subtree, right) => tree(digit2(e,a), subtree.cons(node3(b,c,d)), right),
    snoc: e => (left, subtree)  => tree(left, subtree.snoc(node3(a,b,c)), digit2(d,e)),
    foldl: (op,z) => op(op(op(foldl(op,z)(a),foldl(op,z)(b)),foldl(op,z)(c)),foldl(op,z)(d)),
    size: size(a) + size(b) + size(c) + size(d)
  });

  node2 = (a,b) => ({
    toString: () => `node(${a},${b})`,
    foldl: (op,z) => op(op(z,foldl(op,z)(a)),foldl(op,z)(b)),
    size: size(a) + size(b)
  });
  node3 = (a,b,c) => ({
    toString: () => `node(${a},${b},${c})`,
    foldl: (op,z) => op(op(op(z,foldl(op,z)(a)),foldl(op,z)(b)),foldl(op,z)(c)),
    size: size(a) + size(b) + size(c)
  })

  return {
    empty: empty,
    single: single,
    tree: tree,
    digit1: digit1,
    digit2: digit2,
    digit3: digit3,
    digit4: digit4,
    node2: node2,
    node3: node3,
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/><br/><br/><br/>
### This is tree size`
)});
  main.variable(observer()).define(["FingerTreeWithSize"], function(FingerTreeWithSize)
{
  const ft = FingerTreeWithSize;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const build = n => n === 0 ? ft.empty : build(n-1).cons(chars.charAt(n-1));

  const sample = build(26);
  
  return sample + '\n\n' + sample.size;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/>
### Size allows search by index, log(n) time
- On top, we know the sizes of each finger, and the size of subtree
- Go to subtree; find which node or which subtree has it (check sizes)
- This operation takes at most 9 comparisons
- Repeat \`log(n)\` times

`
)});
  main.variable(observer("FingerTreeIndexed")).define("FingerTreeIndexed", function()
{
  const foldl = (op, z) => v => (v.foldl === undefined) ? op(z,v) : v.foldl(op, z);
  const size = v => (v.size === undefined) ? 1 : v.size;
  const at = a => i => i < 0 || i >= size(a) ? undefined : (a.at != undefined) ? a.at(i) : i === 0 ? a : undefined;
  const at2 = (a,b)     => i => i < size(a) ? at(a)(i) : at(b)(i - size(a));
  const at3 = (a,b,c)   => i => i < size(a) ? at(a)(i) : at2(b,c)(i - size(a));
  const at4 = (a,b,c,d) => i => i < size(a) ? at(a)(i) : at3(b,c,d)(i - size(a));
  
  var digit1, digit2, digit3, digit4, node2, node3, empty, single, tree;
  
  tree = (left, subtree, right) => ({
    st: subtree,
    toString: () => `tree(${left},${subtree},${right})`,
    cons: a => (left.cons)(a)(subtree, right),
    snoc: a => (right.snoc)(a)(left, subtree),
    foldl: (op,z) => op(op(op(z, foldl(op,z)(left)), foldl(op,z)(subtree)), foldl(op,z)(right)),
    size: left.size + subtree.size + right.size,
    at: at3(left, subtree, right)
  });
  
  single = a => ({
    toString: () => `single(${a})`,
    cons: b => (tree(digit1(b), empty, digit1(a))),
    snoc: b => (tree(digit1(a), empty, digit1(b))),
    foldl: (op,z) => foldl(op,z)(a),
    size: size(a),
    at: at(a)
  });
  
  empty = {
    toString: () => "<>",
    cons: single,
    snoc: single,
    foldl: (op,z) => z,
    size: 0,
    at: i => undefined
  };

  digit1 = a => ({
    toString: () => `[${a}]`,
    cons: b => (subtree, right) => tree(digit2(b,a), subtree, right),
    snoc: b => (left, subtree)  => tree(left, subtree, digit2(a,b)),
    foldl: (op,z) => foldl(op,z)(a),
    size: size(a),
    at: at(a)
  });
  
  digit2 = (a,b) => ({
    toString: () => `[${a},${b}]`,
    cons: c => (subtree, right) => tree(digit3(c,a,b), subtree, right),
    snoc: c => (left, subtree) => tree(left, subtree, digit3(a,b,c)),
    foldl: (op,z) => op(foldl(op,z)(a),foldl(op,z)(b)),
    size: size(a) + size(b),
    at: at2(a,b)
  });

  digit3 = (a,b,c) => ({
    toString: () => `[${a},${b},${c}]`,
    cons: d => (subtree, right) => tree(digit4(d,a,b,c), subtree, right),
    snoc: d => (left, subtree)  => tree(left, subtree, digit4(a,b,c,d)),
    foldl: (op,z) => op(op(foldl(op,z)(a),foldl(op,z)(b)),foldl(op,z)(c)),
    size: size(a) + size(b) + size(c),
    at: at3(a,b,c)
  });

  digit4 = (a,b,c,d) => ({
    toString: () => `[${a},${b},${c},${d}]`,
    cons: e => (subtree, right) => tree(digit2(e,a), subtree.cons(node3(b,c,d)), right),
    snoc: e => (left, subtree)  => tree(left, subtree.snoc(node3(a,b,c)), digit2(d,e)),
    foldl: (op,z) => op(op(op(foldl(op,z)(a),foldl(op,z)(b)),foldl(op,z)(c)),foldl(op,z)(d)),
    size: size(a) + size(b) + size(c) + size(d),
    at: at4(a,b,c,d)
  });

  node2 = (a,b) => ({
    toString: () => `node(${a},${b})`,
    foldl: (op,z) => op(op(z,foldl(op,z)(a)),foldl(op,z)(b)),
    size: size(a) + size(b),
    at: at2(a,b)
  });
  node3 = (a,b,c) => ({
    toString: () => `node(${a},${b},${c})`,
    foldl: (op,z) => op(op(op(z,foldl(op,z)(a)),foldl(op,z)(b)),foldl(op,z)(c)),
    size: size(a) + size(b) + size(c),
    at: at3(a,b,c)
  })

  return {
    empty: empty,
    single: single,
    tree: tree,
    digit1: digit1,
    digit2: digit2,
    digit3: digit3,
    digit4: digit4,
    node2: node2,
    node3: node3,
  }
}
);
  main.variable(observer()).define(["FingerTreeIndexed"], function(FingerTreeIndexed)
{
  const ft = FingerTreeIndexed;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const build = n => n === 0 ? ft.empty : build(n-1).snoc(chars.charAt(n-1));

  const sample = build(26);
  
  var out = "\n";
  for (var i = 0; i < 26; i++) {
    out += sample.at(i) + ' ';
  }
  out += '\n';
  for (var i = 25; i >= 0; i--) {
    out += sample.at(i) + ' ';
  }
  return out+'\n';
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/>
### Going more abstract. Measure`
)});
  main.variable(observer("FingerTreeWithMeasure")).define("FingerTreeWithMeasure", function(){return(
measure => {
  const measureOf = v => (v.measure === undefined) ? measure(v) : v.measure;
  const at = a => v => v < 0 || v >= measureOf(a) ? undefined : (a.at != undefined) ? a.at(v) : a;
  const at2 = (a,b)     => v => v < measureOf(a) ? at(a)(v) : at(b)(v - measureOf(a));
  const at3 = (a,b,c)   => v => v < measureOf(a) ? at(a)(v) : at2(b,c)(v - measureOf(a));
  const at4 = (a,b,c,d) => v => v < measureOf(a) ? at(a)(v) : at3(b,c,d)(v - measureOf(a));
  
  var digit1, digit2, digit3, digit4, node2, node3, empty, single, tree;
  
  tree = (left, subtree, right) => ({
    lf: left,
    rf: right,
    st: subtree,
    toString: () => `tree(${left},${subtree},${right})`,
    snoc: a => (right.snoc)(a)(left, subtree),
    measure: left.measure + subtree.measure + right.measure,
    at: at3(left, subtree, right)
  });
  
  single = a => ({
    toString: () => `single(${a})`,
    snoc: b => (tree(digit1(a), empty, digit1(b))),
    measure: measureOf(a),
    at: at(a)
  });
  
  empty = {
    toString: () => "<>",
    snoc: single,
    measure: 0,
    at: value => undefined
  };

  digit1 = a => ({
    toString: () => `[${a}]`,
    snoc: b => (left, subtree)  => tree(left, subtree, digit2(a,b)),
    measure: measureOf(a),
    at: at(a)
  });
  
  digit2 = (a,b) => ({
    toString: () => `[${a},${b}]`,
    snoc: c => (left, subtree) => tree(left, subtree, digit3(a,b,c)),
    measure: measureOf(a) + measureOf(b),
    at: at2(a,b)
  });

  digit3 = (a,b,c) => ({
    toString: () => `[${a},${b},${c}]`,
    snoc: d => (left, subtree)  => tree(left, subtree, digit4(a,b,c,d)),
    measure: measureOf(a) + measureOf(b) + measureOf(c),
    at: at3(a,b,c)
  });

  digit4 = (a,b,c,d) => ({
    toString: () => `[${a},${b},${c},${d}]`,
    snoc: e => (left, subtree)  => tree(left, subtree.snoc(node3(a,b,c)), digit2(d,e)),
    measure: measureOf(a) + measureOf(b) + measureOf(c) + measureOf(d),
    at: at4(a,b,c,d)
  });

  node2 = (a,b) => ({
    toString: () => `node(${a},${b})`,
    measure: measureOf(a) + measureOf(b),
    at: at2(a,b)
  });
  node3 = (a,b,c) => ({
    toString: () => `node(${a},${b},${c})`,
    measure: measureOf(a) + measureOf(b) + measureOf(c),
    at: at3(a,b,c)
  })

  return {
    empty: empty,
    single: single,
    tree: tree,
    digit1: digit1,
    digit2: digit2,
    digit3: digit3,
    digit4: digit4,
    node2: node2,
    node3: node3,
  }
}
)});
  main.variable(observer()).define(["FingerTreeWithMeasure","md"], function(FingerTreeWithMeasure,md)
{
  const measure = value => value.length;
  const ft = FingerTreeWithMeasure(measure);

  const build = n => n === 0 ? ft.empty : build(n-1).snoc('' + String.fromCharCode(n + 64));

  const sample = build(26);

  var out = ''
  for (var i = 0; i < 26; i++) {
    out += sample.at(i) + ' ';
  }

  return md`### char by index:\n\`${out}\``;
}
);
  main.variable(observer()).define(["FingerTreeWithMeasure","html"], function(FingerTreeWithMeasure,html)
{
  const ft = FingerTreeWithMeasure(value => value.length);
  
  const words = ['Once', 'upon', 'a', 'midnight', 'dreary', 'while', 'I', 'pondered', 'weak', 'and', 'weary'];

  const build = words => {
    const add = (n => (n === 0 ? ft.empty : add(n-1).snoc(words[n-1]))); // could use Y-combinator
    return add(words.length)
  }

  const sample = build(words);
  
  var j = 0;
  var rel = 0;
  var ruler0 = '';
  var ruler1 = '';
  for (var i = 0; i < sample.measure; i++) {
    if (rel == words[j].length) {
      j += 1;
      rel = 0;
      ruler0 += ' '
      ruler1 += '&nbsp;'
    }
    ruler1 += i%10 == 0 ? i/10 : '&nbsp;';
    rel += 1;
    ruler0 += '' + (i % 10);
  }
  return html`<h3>word by position</h3><br>
                 <code>${words.map((w,i) => w + ' ')}<br/>
                 ${ruler0}<br/>${ruler1}<br/><br/>
                 sample.at(10) = "${sample.at(10)}"<br/>
                 sample.at(41) = "${sample.at(41)}"<br/>
                 sample.at(28) = "${sample.at(28)}"</code>`
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/>
### Better Graphic Representation. 

`
)});
  main.variable(observer("viewof button1")).define("viewof button1", ["html"], function(html){return(
html`<form>${Object.assign(html`<button type=button>Start for animation`, {onclick: event => event.currentTarget.dispatchEvent(new CustomEvent("input", {bubbles: true}))})}`
)});
  main.variable(observer("button1")).define("button1", ["Generators", "viewof button1"], (G, _) => G.input(_));
  main.variable(observer()).define(["button1","FingerTreeWithShow","html","Promises"], async function*(button1,FingerTreeWithShow,html,Promises)
{
  button1;
  const w = 1800
  const h = 1200
  const _ = FingerTreeWithShow
  const charAt = n => String.fromCharCode(n + (n < 11 ? 47 : n < 37 ? 54 : n < 63? 60 : ('А'.charCodeAt(0) - 63)))
  const build = n => n === 0 ? _.empty : build(n-1).snoc(charAt(n))
  
  function show(ft, fts) {
    return html`<svg width=${w} height=${h}>
                  <text x="10" y="15">${ft.toString()}</text>
                  <g transform="translate(300,25) scale(0.8)">${fts.buf}</g>
                </svg>`
  }
  
  var dt = 300
  
  for (var i = 0; i < 220; i++) {
    let tree = build(i);
    var fts = tree.show()
    yield show(tree, fts)
    await Promises.delay(dt)
    if (fts.rightCarry) {
      fts = tree.show(true, true)
      yield show(tree, fts)
      await Promises.delay(dt*5/2)
    }
    dt -= 2
  }
}
);
  main.variable(observer("FingerTreeWithShow")).define("FingerTreeWithShow", function()
{
  var digit1, digit2, digit3, digit4, empty, single, tree;
  const dotSize = 5
  const valueSize = 26
  const valueR = valueSize / 2
  const nodeSize = 66
  const nodeR = nodeSize / 2
  const vStep = 10
  const sq32 = Math.sqrt(3)/2
  const gap = 5
  const Gap = 30
  const linkColor = '#00ff00'
  const endColor = '#ff0000'
  
  function insert(element, elements) {
    let buf = element.buf;
    let w = element.w;
    let h = element.h;
    var q;
    for (var i = 0; i < elements.length; i++) {
      buf += elements[i].buf
    }
    return {
      buf: buf,
      w: w,
      h: h,
      cx: element.cx,
      cy: element.cy,
      r: element.r,
      q: elements[0].q
    };
  }
    
  function join(elements) {
    let buf = ''
    let w = 0
    let h = 0
    let q = 1
    let cx = 0
    for (var i = 0; i < elements.length; i++) {
      buf += elements[i].buf
      w += elements[i].w
      cx += elements[i].cx
      h = Math.max(h, elements[i].h)
      q = Math.min(h, elements[i].q)
    }
    return {
      buf: buf,
      w: w,
      h: h,
      q: q,
      cx: cx / elements.length,
      cy: elements[0].cy,
      r: elements[0].r,
      elements: elements
    };
  }
      
  const circleSvg = (radius, color, opacity) =>
    `<circle cx="0" cy="${radius}" r="${radius}", stroke="black"  fill="${color}" fill-opacity="${opacity}" />`
  
  const valueCircle = circleSvg(valueR, '#000C3F', '0.05')
  
  const nodeCircle = {
    buf: circleSvg(nodeR, '#000C3F', '0.05'), 
    w: nodeSize,
    h: nodeSize,
    cx: 0,
    cy: nodeR,
    r: nodeR,
    q: 1
  };
  
  const dot = color => ({
    buf: `<circle cx="0" cy="0" r="${dotSize}", stroke="black" fill="${color}" />`, 
    w: dotSize + Gap, 
    h: dotSize,
    cx: 0,
    cy: 0,
    r: dotSize,
    q: 1})
  
  const endDot = dot(endColor)
  const anchor = dot(linkColor)

  const highlightStyle = ' style="fill:yellow;stroke:purple;stroke-width:1;fill-opacity:0.1"'
  
  const ellipse = (x, y, r1, r2) =>
      `<ellipse cx="${x}" cy="${y}" rx="${r1}" ry="${r2}" ${highlightStyle} />` 
  const highlight = (x, y, r) => ellipse(x, y, 2*r, r)
    
  const line = (x1,y1) => (x2,y2) => `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" style="stroke: black"/>`

  const arrow = w => (x1,y1) => function(x2,y2) {
    let dy = (x2-x1)
    let dx = (y2-y1)
    let len = Math.sqrt(dx*dx+dy*dy)
    let sx = dx/len*w
    let sy = dy/len*w
    return `<polygon ${highlightStyle} 
            points="${x1+sx} ${y1-sy}, ${x1-sx} ${y1+sy}, ${x2-sx-2*sy} ${y2+sy-2*sx}, ${x2-2*sx-2*sy} ${y2+2*sy-2*sx}, ${x2} ${y2}, ${x2+2*sx-2*sy} ${y2-2*sy-2*sx}, ${x2+sx-2*sy} ${y2-sy-2*sx}, ${x1+sx} ${y1-sy}" />`
  }

  const translate = (x, y) => element =>
      (x==0 && y==0) ? element : ({
        buf:`\n<g transform="translate(${x},${y})">\n${element.buf}\n</g>`,
        w: element.w,
        h: element.h,
        cx: element.cx + x,
        cy: element.cy + y,
        r: element.r,
        q: element.q,
        elements: element.elements ? element.elements.map(e => translate(x,y)(e)) : undefined,
        rightCarry: element.rightCarry,
        leftCarry: element.leftCarry
      })
  ;
  
  const scale = s => element => 
      s==1 ? element : ({
        buf: `\n<g transform="scale(${s})">\n${element.buf}\n</g>`,
        w: element.w * s, 
        h: element.h * s,
        cx: element.cx * s,
        cy: element.cy * s,
        r: element.r * s,
        q: element.q* s,
        elements: element.elements ? element.elements.map(e => scale(s)(e)) : undefined,
        rightCarry: element.rightCarry,
        leftCarry: element.leftCarry
      });
  
  const valueContainer = a => ({
    buf: `${valueCircle}
      <text x="0" y="${valueR - 1}" dy="0.35em" text-anchor="middle">${a}</text>`,
      w: valueSize,
      h: valueSize, 
      cx: 0,
      cy: valueR,
      r: valueR,
      q: 1
  })
 
  const show = a => function() {
    let element = (!a || a.show === undefined) ? valueContainer(a) : a.show();
    return element
  }
  
  function showFingers(values) {
    var elements = []
    var pos = 0
    var w = 0
    for (var i = 0; i < values.length; i++) {
      let element = show(values[i])()
      let q = Math.sqrt(element.q)
      let positionedElement = translate(pos, 0)(scale(1/q)(element))
      elements.push(positionedElement)
      w = pos
      pos += positionedElement.w + gap
    }
    let result = join(elements)
    result.elements = elements
    result.carry = values.length > 3
    result.w = w
    return result
  }
   
  function showNode2(a, b) {
    let left0 = show(a)();
    let innerR = left0.r
    let xInner = nodeR/2
    let s = Math.min((nodeR - gap*2)/innerR/2, 1)
    let yInner = nodeR - gap - s*innerR/2
    let left1 = scale(s)(left0)
    let left = translate(-xInner, yInner)(left1)
    let right1 = scale(s)(show(b)())
    let right = translate(xInner, yInner)(right1)
    let result = insert(nodeCircle, [left, right])
    return result
  }
  
  function showNode3(a, b, c) {
    let top0 = show(a)()
    let innerR = top0.r
    let s = Math.min((nodeR - gap*2)/innerR/2, 1)
    let dSize = nodeR - s*innerR
    let top1 = scale(s)(top0)
    let top = translate(0, dSize/2 - gap)(top1)
    let left = translate(-nodeR*sq32/2, nodeR)(scale(s)(show(b)()))
    let right = translate(nodeR*sq32/2, nodeR)(scale(s)(show(c)()))
    return insert(nodeCircle, [top, left, right])
  }
  
  const connect = (element1) => (element2) => element1 === element2 ? '' :
    line(element1.cx, element1.cy + element1.r)(element2.cx, element2.cy - element2.r)
  
  function showTree(left, subtree, right, withHighlightLeft, withHighlightRight, dLeft, dRight) {
    let l0 = left ? left.show() : null;
    let r0 = right ? right.show() : null;
    let doHightlightLeft = l0 && l0.carry && withHighlightLeft
    let doHightlightRight = r0 && r0.carry && withHighlightRight
    if (left == null && right == null) throw "no left no right; subtree: " + subtree
    let fingerH = l0 ? l0.h : r0.h
    let halfSize = fingerH/2
    let shift = Gap + halfSize
    let branchY = halfSize/2 + vStep
    let l = l0 ? translate(-dLeft -shift - l0.w, branchY)(l0) : null;
    let withAnchor = connect(anchor)
    if (dLeft == 0 && l0) l.buf += l.elements.map(e => withAnchor(e)).join('\n')
        
    let r = r0 ? translate(dRight + shift, branchY)(r0) : null;
    if (dRight == 0 && r0) r.buf += r.elements.map(e => withAnchor(e)).join('\n')

    let m0 = subtree.show(doHightlightLeft, doHightlightRight);
    let m = translate(0, 0 + fingerH + branchY)(m0)
    m.buf += line(0, anchor.r)(0, m.cy - m.r)
    let elements = [anchor, m]
    if (l) elements.push(l)
    if (r) elements.push(r)
    let result = join(elements);
    result.rightCarry = r0 && r0.carry
    result.leftCarry = l0 && l0.carry
    result.left = l
    result.right = r
      
    if (doHightlightLeft) {
      result.buf += highlight(l.cx + l.r, l.cy, l.h * 0.85)
    }
    if (doHightlightRight) {
      result.buf += highlight(r.cx - r.r, r.cy, r.h * 0.85)
    }
    return result
  }
  
  tree = (left, subtree, right) => ({
    toString: () => `tree(${left},${subtree},${right})`,
    cons: a => left.cons(a)(subtree, right),
    snoc: a => (right.snoc)(a)(left, subtree),
    st: subtree,
    show: (withHighlightLeft, withHighlightRight) => showTree(left, subtree, right, withHighlightLeft, withHighlightRight, 0, 0),
    showWithLeftBranchStretched: d => showTree(left, subtree, right, false, false, d, 0),
    showWithRightBranchStretched: d => showTree(left, subtree, right, false, false, 0, d),
    dropLeft: () => ({
      tree: tree(null, subtree, right),
      branch: left
    }),
    dropRight: () => ({
      tree: tree(left, subtree, null),
      branch: right
    }),
    left: left,
    subtree: subtree,
    right: right
  });
  
  single = a => ({
    toString: () => `single(${a})`,
    cons: b => tree(digit1(b), empty, digit1(a)),
    snoc: b => (tree(digit1(a), empty, digit1(b))),
    show: function() {
      let element = showFingers([a])
      let cell = element.elements[0]
      let positioned = translate(0, cell.h/4 + vStep)(cell)
      let anchor = dot(linkColor)
      positioned.buf += connect(anchor)(positioned)    
      return insert(anchor, [positioned])
    }
  });

  empty = {
    toString: () => "<>",
    snoc: single,
    cons: single,
    show: () => endDot
  };

  digit1 = a => ({
    toString: () => `[${a}]`,
    cons: b => (subtree, right) => tree(digit2(b,a), subtree, right),
    snoc: b => (left, subtree)  => tree(left, subtree, digit2(a,b)),
    show: () => showFingers([a]),
    values: [a]
  });
  
  digit2 = (a,b) => ({
    toString: () => `[${a},${b}]`,
    cons: c => (subtree, right) => tree(digit3(c,a,b), subtree, right),
    snoc: c => (left, subtree) => tree(left, subtree, digit3(a,b,c)),
    show: () => showFingers([a,b]),
    values: [a,b]
  });

  digit3 = (a,b,c) => ({
    toString: () => `[${a},${b},${c}]`,
    cons: d => (subtree, right) => tree(digit4(d,a,b,c), subtree, right),
    snoc: d => (left, subtree)  => tree(left, subtree, digit4(a,b,c,d)),
    show: () => showFingers([a,b,c]),
    values: [a,b,c]
  });

  digit4 = (a,b,c,d) => ({
    toString: () => `[${a},${b},${c},${d}]`,
    cons: e => (subtree, right) => tree(digit2(e,a), subtree.cons(node3(b,c,d)), right),
    snoc: e => (left, subtree)  => tree(left, subtree.snoc(node3(a,b,c)), digit2(d,e)),
    show: () => showFingers([a,b,c,d]),
    values: [a,b,c,d]
  });
  
  const node2 = (a,b) =>  ({
    toString: () => `node(${a},${b})`,
    show: () => showNode2(a,b)
  });

  const node3 = (a,b,c) => ({
    toString: () => `node(${a},${b},${c})`,
    show: () => showNode3(a,b,c)
  });
  
  return {
    empty: empty,
    single: single,
    tree: tree,
    digit1: digit1,
    digit2: digit2,
    digit3: digit3,
    digit4: digit4,
    node2: node2,
    node3: node3,
    show: show,
    translate: translate,
    scale: scale,
    highlight: highlight,
    ellipse: ellipse,
    join: join,
    arrow: arrow,
    showFingers: showFingers,
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## Alternating \`cons\` and \`snoc\``
)});
  main.variable(observer("viewof button2")).define("viewof button2", ["html"], function(html){return(
html`<form>${Object.assign(html`<button type=button>Start for animation`, {onclick: event => event.currentTarget.dispatchEvent(new CustomEvent("input", {bubbles: true}))})}`
)});
  main.variable(observer("button2")).define("button2", ["Generators", "viewof button2"], (G, _) => G.input(_));
  main.variable(observer()).define(["button2","FingerTreeWithShow","html","Promises"], async function*(button2,FingerTreeWithShow,html,Promises)
{
  button2;
  const _ = FingerTreeWithShow
  const charAt = n => String.fromCharCode(n + (n < 11 ? 47 : n < 37 ? 54 : n < 63? 60 : ('А'.charCodeAt(0) - 63)));
  function build(n) {
    if (n === 0) return _.empty
    let previous = build(n-1)
    let value = charAt(n)
    return (n % 2 == 0 ? previous.cons : previous.snoc)(value)
  }
  
  function show(ft, fts, w, h) {
    return html`<svg width=${w} height=${h}>
<text x="10" y="15">${ft.toString()}</text>
<g transform="translate(500,50) scale(0.7)">${fts.buf}</g>
</svg>`
  }
  
  var dt = 150
  
  for (var i = 0; i < 390; i++) {
    let tree = build(i);
    var fts = tree.show()
    yield show(tree, fts, 1800, 800);
    await Promises.delay(dt)
    if (i % 4 == 0) dt -= 1
  }
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`<br/>
## Some Good Parts: Merge of two Finger Trees.`
)});
  main.variable(observer("viewof button3")).define("viewof button3", ["html"], function(html){return(
html`<form>${Object.assign(html`<button type=button>Start for animation`, {onclick: event => event.currentTarget.dispatchEvent(new CustomEvent("input", {bubbles: true}))})}`
)});
  main.variable(observer("button3")).define("button3", ["Generators", "viewof button3"], (G, _) => G.input(_));
  main.variable(observer()).define(["button3","FingerTreeWithShow","Promises","html"], async function*(button3,FingerTreeWithShow,Promises,html)
{
  button3;
  const _ = FingerTreeWithShow;
  const charAt = n => String.fromCharCode(n + (n < 11 ? 47 : n < 37 ? 54 : n < 63? 60 : ('А'.charCodeAt(0) - 63)));

  function build(n, base) {
    if (n === 0) return _.empty
    let previous = build(n-1, base)
    let value = charAt(n + base)
    return (n % 2 == 0 ? previous.cons : previous.snoc)(value)
  }
  const middleX = 490
  
  const timeScale = 50
  var dt = timeScale
  function sleep(n) {
    return Promises.delay(n*timeScale)
  }
  
  var leftTree = build(36, 0)
  let rightTree = build(26, 36)
  var leftTreeRepr = leftTree.show()
  var rightTreeRepr = rightTree.show()
  
  var distance = 1000

  const finalDistance = 498

  function show(middle, text, extra) {
    return html`<svg width=1800 height=500>
        <text x="450" y="15" text-anchor="middle">${text}</text>
        <g transform="translate(${middleX},50) scale(0.8)">${middle ? middle.buf : ''}</g>
        <g transform="translate(${middleX + distance/2 + 3},50) scale(0.8)">${rightTreeRepr.buf}</g>
        <g transform="translate(${middleX - distance/2},50) scale(0.8)">${leftTreeRepr.buf}</g>
        ${extra}
      </svg>`
  }
  
  let ellipse1 = d => _.ellipse(middleX + 5, 73, 240 - d*0.8, 25)

  for (; distance >= finalDistance; distance -= 8) {
    yield show(null, 'two trees preparing to merge ', '')
    await sleep(1)
  }
  await sleep(20)

  yield show(null, 'trim opposing branches', ellipse1(0))
  await sleep(20)
  
  for (var d = 0; d < 180; d+=4) {
    leftTreeRepr = leftTree.showWithRightBranchStretched(d)
    rightTreeRepr = rightTree.showWithLeftBranchStretched(d)
    
    yield show(null, 'connect the fingers ', ellipse1(d))
    await sleep(1)
  }
  await sleep(10)
  
  let trimmedLeftTree = leftTree.dropRight()
  let trimmedRightTree = rightTree.dropLeft()
  var leftElements = leftTreeRepr.right
  var rightElements = rightTreeRepr.left
  var leftElementsInPlaces =
      _.translate(-leftElements.cx-leftElements.w/2 - 2*leftElements.r - 5, 0)(leftElements).elements
  var rightElementsInPlaces =
      _.translate(-rightElements.cx+rightElements.w/2, 0)(rightElements).elements
  let els1 = leftElementsInPlaces.concat(rightElementsInPlaces)
  let middleBranch = _.join(els1)  
  leftTreeRepr = trimmedLeftTree.tree.show()
  rightTreeRepr = trimmedRightTree.tree.show()
  
  yield show(middleBranch, 'seven cells to distribute ', ellipse1(d))
  await sleep(30)

  yield show(middleBranch, 'start with these three', _.ellipse(middleX - 50, 73, 40, 20))
  await sleep(40)
  
  let valuesLevel1 = trimmedLeftTree.branch.values.concat(trimmedRightTree.branch.values)
  let node21 = _.node3(valuesLevel1[0], valuesLevel1[1], valuesLevel1[2])
  let node21s = _.translate(-100, 70)(node21.show())
  els1.splice(0, 3)
  var midArray1 = _.join(els1.concat([node21s]))

  let myarrow = _.arrow(5)
  
  yield show(midArray1, 'first three done', _.ellipse(middleX - 50, 73, 40, 20) + myarrow(middleX-70,91)(middleX-75,105))
  await sleep(40)

  yield show(midArray1, 'now do these', _.ellipse(middleX + 13, 73, 25, 15))
  await sleep(30)
  
  els1.splice(0, 2)
  let node22 = _.node2(valuesLevel1[3], valuesLevel1[4])
  let node22s = _.translate(-30, 70)(node22.show())
  let midArray10 = _.join(els1.concat([node21s, node22s]))
  midArray1 = midArray10
  
  yield show(midArray1, 'two more done', _.ellipse(middleX + 13, 73, 25, 15) + myarrow(middleX-7,87)(middleX-17,105))
  await sleep(30)

  yield show(midArray1, 'will do the last two', _.ellipse(middleX + 60, 73, 25, 15))
  await sleep(20)
  
  for (var t = 0; t < 10; t++) {
      await sleep(1)
      distance += 2
      midArray1 = _.translate(-t, 0)(midArray10)
      yield show(midArray1, 'will do the last two', _.ellipse(middleX + 60 -t/2, 73, 25, 15))
      await sleep(1)
  }
  await sleep(10)

  let node23 = _.node2(valuesLevel1[5], valuesLevel1[6])
  let node23s = _.translate(40, 70)(node23.show())
  midArray1 = _.translate(-4, -1)(_.scale(1.05)((_.join([node21s, node22s, node23s]))))
  yield show(midArray1, 'done at this level', _.ellipse(middleX + 50, 73, 25, 15) + myarrow(middleX+41,88)(middleX+35,106))
  await sleep(30)

  yield show(midArray1, 'Now is time to do the next level', finalDistance, null)
  await sleep(30)
  let t11cut = trimmedLeftTree.tree.subtree.dropRight()
  let t21cut = trimmedRightTree.tree.subtree.dropLeft()
  let valuesLevel2 = t11cut.branch.values.concat([node21,node22,node23]).concat(t21cut.branch.values)
  let valuesLevel21s = _.showFingers(valuesLevel2)
  let leftBranch = leftTree.left
  let rightBranch = rightTree.right
  
  leftTreeRepr = _.tree(leftBranch, t11cut.tree, null).show()
  rightTreeRepr = _.tree(null, t21cut.tree, rightBranch).show()
  midArray1 = _.translate(-257,70)(valuesLevel21s)

   yield show(midArray1, 'Second level nodes to process', null)
  await sleep(30)
  yield show(midArray1, 'will work on these three', _.ellipse(middleX - 145, 135, 100, 40))
  await sleep(40)
  let node31 = _.node3(valuesLevel2[0], valuesLevel2[1], valuesLevel2[2])
  let node31s = _.translate(-100, 180)(_.scale(1.8)(node31.show()))
  valuesLevel2.splice(0, 3)
  let valuesLevel22s = _.showFingers(valuesLevel2)

  midArray1 = _.join([_.translate(-23,70)(valuesLevel22s), node31s])
  yield show(midArray1, 'three nodes wrapped and moved',
             _.ellipse(middleX - 145, 135, 100, 40) + myarrow(middleX - 104, 171)(middleX-98, 197))
  await sleep(40)

  yield show(midArray1, 'will wrap another three', _.ellipse(middleX +35, 135, 100, 40))
  await sleep(30)

  let node32 = _.node3(valuesLevel2[0], valuesLevel2[1], valuesLevel2[2])
  let node32s = _.translate(33, 180)(_.scale(1.8)(node32.show()))
  valuesLevel2.splice(0, 3)
  let valuesLevel23s = _.showFingers(valuesLevel2)

  midArray1 = _.join([_.translate(201,70)(valuesLevel23s), node31s, node32s])
  
   yield show(midArray1, 'another three nodes wrapped and moved',
            _.ellipse(middleX + 35, 135, 100, 40) + myarrow(middleX + 35, 175)(middleX+ 33, 192))
  await sleep(30)

  yield show(midArray1, 'the last two nodes to move', _.ellipse(middleX + 190, 135, 70, 40))
  await sleep(25)
  let node33 = _.node2(valuesLevel2[0], valuesLevel2[1])
  let node33s = _.translate(165, 180)(_.scale(1.8)(node33.show()))

  midArray1 = _.join([node31s, node32s, node33s])
  yield show(midArray1, 'two last nodes grouped and moved',
          _.ellipse(middleX + 190, 135, 70, 40) + myarrow(middleX + 156, 170)(middleX+ 147, 195))
  await sleep(40)
  
  function addAtLevel3(node) {
    let leftSub = leftTree.subtree
    let leftSubSub = leftSub.subtree
    leftTree = _.tree(leftTree.left, 
                 _.tree(leftSub.left, 
                        leftSubSub.snoc(node), null), null)
    leftTreeRepr = leftTree.show()
  }

  midArray1 = _.join([node32s, node33s])
  addAtLevel3(node31)
  yield show(midArray1, 'appending nodes to longest tree')
  await sleep(40)

  addAtLevel3(node32)
  yield show(node33s, 'appending nodes to the longest tree')
  await sleep(30)

  addAtLevel3(node33)
  yield show(null, 'appending nodes to the longest tree')
  await sleep(20)

  for (; distance > -3; distance -= 5) {
    yield show(null, 'now merging the trunks ')
    await sleep(1)
  }

  yield show(null, 'Congratulations! We are done merging!')
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## References
- [Hinze, Patterson, "Finger Trees: A Simple General-purpose Data Structure"](http://www.staff.city.ac.uk/~ross/papers/FingerTree.html)
- [Practical Introduction to finger trees](https://chrispenner.ca/posts/intro-to-finger-trees)
- [finger trees done right](https://scienceblogs.com/goodmath/2010/04/26/finger-trees-done-right-i-hope)
- [https://github.com/qiao/fingertree.js/blob/master/src/fingertree.js]()
- [https://github.com/aureooms/js-fingertree](https://github.com/aureooms/js-fingertree)
- [Nick Stanchenko, "Unzipping Immutability"](https://stanch.github.io/reftree/talks/Immutability.html)
- [this presentation](https://observablehq.com/@vpatryshev/finger-trees-in-js)

`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`<br/><br/>
# Thank You!
<br/><br/><br/><br/>
### Special thanks to<br/>&nbsp;&nbsp;&nbsp;Alexy, Oli, Salar, KP, and other organizers of Scale by the Bay 2020
<br/><br/><br/><br/>
### Special thanks to<br/>&nbsp;&nbsp;&nbsp;Mike Bostock who created [https://observablehq.com](https://observablehq.com)
<br/><br/><br/><br/>

`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
