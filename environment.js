var development = {
	TITLE : "CornerWriters",

	DOMAIN : "http://localhost:50001",
	CALLBACK : "http://localhost:50001/callback",

	AUTH0_CLIENT_ID : "4jCZ8hXvP0qtRfpe2ay878QUtcfuUeUB",
	AUTH0_DOMAIN : "cornerwriters.eu.auth0.com",
	AUTH0_CLIENT_SECRET : "PZM8yWOzOB8B-ym-ukgna9zKr9UjulttikPyH027lZuxNnBxYx9i8uzTpyRLzX5S",

	SQLHOST : "localhost",
	SQLDB : "CornerWriters",
	SQLUSER : "root",
	SQLPASS : "Parola00"
};


var production = {
	TITLE : "CornerWriters",

	DOMAIN : "http://68.66.241.102:50001",
	CALLBACK : "http://68.66.241.102:50001/callback",

	AUTH0_CLIENT_ID : "4jCZ8hXvP0qtRfpe2ay878QUtcfuUeUB",
	AUTH0_DOMAIN : "cornerwriters.eu.auth0.com",
	AUTH0_CLIENT_SECRET : "PZM8yWOzOB8B-ym-ukgna9zKr9UjulttikPyH027lZuxNnBxYx9i8uzTpyRLzX5S",

	SQLHOST : "localhost",
	SQLDB : "CornerWriters",
	SQLUSER : "root",
	SQLPASS : "Parola00"
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

	

