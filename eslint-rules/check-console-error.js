export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'try-catch内のconsole.errorにname, message, stackが含まれていない場合に警告する',
        },
        schema: [],
    },
    create(context) {
        return {
            TryStatement(node) {
                const catchClause = node.handler;
                if (!catchClause) return;

                const errorVar = catchClause.param?.name;
                if (!errorVar) return;

                const catchBody = catchClause.body.body;

                catchBody.forEach((stmt) => {
                    if (
                        stmt.type === 'ExpressionStatement' &&
                        stmt.expression.type === 'CallExpression' &&
                        stmt.expression.callee.type === 'MemberExpression' &&
                        stmt.expression.callee.object.name === 'console' &&
                        stmt.expression.callee.property.name === 'error'
                    ) {
                        const args = stmt.expression.arguments;

                        const usesError = args.some(
                            (arg) => arg.type === 'Identifier' && arg.name === errorVar
                        );

                        const hasName = args.some(
                            (arg) =>
                                arg.type === 'MemberExpression' &&
                                arg.object.name === errorVar &&
                                arg.property.name === 'name'
                        );
                        const hasMessage = args.some(
                            (arg) =>
                                arg.type === 'MemberExpression' &&
                                arg.object.name === errorVar &&
                                arg.property.name === 'message'
                        );
                        const hasStack = args.some(
                            (arg) =>
                                arg.type === 'MemberExpression' &&
                                arg.object.name === errorVar &&
                                arg.property.name === 'stack'
                        );

                        if (usesError && (!hasName || !hasMessage || !hasStack)) {
                            context.report({
                                node: stmt,
                                message:
                                    'try-catch内のconsole.errorには error.name, error.message, error.stack を含めてください。',
                            });
                        }
                    }
                });
            },
        };
    },
};
