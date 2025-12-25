export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'JSON.parseは必ずtry-catchで囲んでください',
        },
        schema: [],
    },
    create(context) {
        /**
         * 親ノードを遡ってtry-catchの中にいるかどうか判定
         * @param {ASTNode} node 
         * @returns {boolean}
         */
        function isInTryCatch(node) {
            let current = node.parent;
            while (current) {
                if (current.type === 'TryStatement') {
                    // nodeがtryブロックの中にあるか判定
                    if (
                        current.block &&
                        current.block.range[0] <= node.range[0] &&
                        node.range[1] <= current.block.range[1]
                    ) {
                        return true;
                    }
                }
                current = current.parent;
            }
            return false;
        }

        return {
            CallExpression(node) {
                // JSON.parseかチェック
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.name === 'JSON' &&
                    node.callee.property.name === 'parse'
                ) {
                    if (!isInTryCatch(node)) {
                        context.report({
                            node,
                            message: 'JSON.parseは必ずtry-catchで囲んでください。',
                        });
                    }
                }
            },
        };
    },
};
