export default {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'JSコード内のclass/id操作の値がケバブケース/スネークケースかチェック',
        },
        schema: [],
    },
    create(context) {
        const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
        const snakeCaseRegex = /^[a-z0-9]+(_[a-z0-9]+)*$/;

        function checkClassNames(value, node) {
            const classes = value.split(/\s+/);
            for (const cls of classes) {
                if (!kebabCaseRegex.test(cls)) {
                    context.report({
                        node,
                        message: `class名 "${cls}" はケバブケースで書いてください。`,
                    });
                }
            }
        }

        function checkIdName(value, node) {
            if (!snakeCaseRegex.test(value)) {
                context.report({
                    node,
                    message: `id名 "${value}" はスネークケースで書いてください。`,
                });
            }
        }

        return {
            CallExpression(node) {
                // classList.add/remove/toggle のチェック
                if (
                    node.callee.type === 'MemberExpression' &&
                    ['add', 'remove', 'toggle'].includes(node.callee.property.name) &&
                    node.callee.object.type === 'MemberExpression' &&
                    node.callee.object.property.name === 'classList'
                ) {
                    for (const arg of node.arguments) {
                        if (arg.type === 'Literal' && typeof arg.value === 'string') {
                            checkClassNames(arg.value, arg);
                        }
                    }
                }

                // element.setAttribute("class", ...) / ("id", ...)
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.property.name === 'setAttribute' &&
                    node.arguments.length >= 2 &&
                    node.arguments[0].type === 'Literal' &&
                    typeof node.arguments[0].value === 'string' &&
                    node.arguments[1].type === 'Literal' &&
                    typeof node.arguments[1].value === 'string'
                ) {
                    const attrName = node.arguments[0].value;
                    const attrValue = node.arguments[1].value;
                    if (attrName === 'class') {
                        checkClassNames(attrValue, node.arguments[1]);
                    } else if (attrName === 'id') {
                        checkIdName(attrValue, node.arguments[1]);
                    }
                }

                // document.getElementById("...")
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.name === 'document' &&
                    node.callee.property.name === 'getElementById' &&
                    node.arguments.length >= 1 &&
                    node.arguments[0].type === 'Literal' &&
                    typeof node.arguments[0].value === 'string'
                ) {
                    checkIdName(node.arguments[0].value, node.arguments[0]);
                }

                // document.getElementsByClassName("...")
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.name === 'document' &&
                    node.callee.property.name === 'getElementsByClassName' &&
                    node.arguments.length >= 1 &&
                    node.arguments[0].type === 'Literal' &&
                    typeof node.arguments[0].value === 'string'
                ) {
                    checkClassNames(node.arguments[0].value, node.arguments[0]);
                }

                // document.querySelector("#some_id") / ".some-class"
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.name === 'document' &&
                    node.callee.property.name === 'querySelector' &&
                    node.arguments.length >= 1 &&
                    node.arguments[0].type === 'Literal' &&
                    typeof node.arguments[0].value === 'string'
                ) {
                    const selector = node.arguments[0].value;
                    if (selector.startsWith('#')) {
                        checkIdName(selector.slice(1), node.arguments[0]);
                    } else if (selector.startsWith('.')) {
                        checkClassNames(selector.slice(1), node.arguments[0]);
                    }
                }
            },

            AssignmentExpression(node) {
                // element.id = "..."
                if (
                    node.left.type === 'MemberExpression' &&
                    node.left.property.name === 'id' &&
                    node.right.type === 'Literal' &&
                    typeof node.right.value === 'string'
                ) {
                    checkIdName(node.right.value, node.right);
                }

                // element.className = "..." (もしあればチェックしたいなら追加可能)
                if (
                    node.left.type === 'MemberExpression' &&
                    node.left.property.name === 'className' &&
                    node.right.type === 'Literal' &&
                    typeof node.right.value === 'string'
                ) {
                    checkClassNames(node.right.value, node.right);
                }
            }
        };
    }
};
