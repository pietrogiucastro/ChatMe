var development = {
    env: 'dev',
	AES_SECRET: "5BbgQ}tC(V5=pwlQ>iz1/+53f(/wfaXVSY$V^kV7YQD4<y3/9`\"\"bE)h*n:QAcy",
	port: 3000,
};


var production = {
    env: 'prd',
	AES_SECRET: "5BbgQ}tC(V5=pwlQ>iz1/+53f(/wfaXVSY$V^kV7YQD4<y3/9`\"\"bE)h*n:QAcy",
	port: 3000,
}

module.exports = function() {

	switch(process.env.NODE_ENV) {
        case 'development':
            return development;

        case 'production':
            return production;

        default:
            throw 'can\'t find NODE_ENV variable. Set it before proceeding:'
            + '\n Unix: "export NODE_ENV=development/production" '
            + '\n Windows: "SET NODE_ENV=development/production" ';
    }

}

	

