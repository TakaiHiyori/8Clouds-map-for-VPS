export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'async関数内のawaitはtry-catchで囲んでください',
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
            AwaitExpression(node) {
                if (!isInTryCatch(node)) {
                    context.report({
                        node,
                        message: 'awaitは必ずtry-catchで囲んでください。',
                    });
                }
            }
        };
    },
};
