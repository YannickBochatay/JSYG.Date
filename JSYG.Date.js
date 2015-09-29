;(function() {
	
    "use strict";
	
    /* 
     * 
     * Si on passe une chaîne en argument, voilà les formats compris :
     * 
     * ////////////////////////////////////////////////////////////////////////
     * rfc2822
     * http://tools.ietf.org/html/rfc2822#page-14
     * ////////////////////////////////////////////////////////////////////////
     * 
		date-time       =       [ day-of-week "," ] date FWS time [CFWS]
		
		day-of-week     =       ([FWS] day-name) / obs-day-of-week
				
		day-name        =       "Mon" / "Tue" / "Wed" / "Thu" /
		                        "Fri" / "Sat" / "Sun"
		
		date            =       day month year
		
		year            =       4*DIGIT / obs-year
		
		month           =       (FWS month-name FWS) / obs-month
		
		month-name      =       "Jan" / "Feb" / "Mar" / "Apr" /
		                        "May" / "Jun" / "Jul" / "Aug" /
		                        "Sep" / "Oct" / "Nov" / "Dec"
		
		day             =       ([FWS] 1*2DIGIT) / obs-day
		
		time            =       time-of-day FWS zone
		
		time-of-day     =       hour ":" minute [ ":" second ]
		
		hour            =       2DIGIT / obs-hour
		
		minute          =       2DIGIT / obs-minute
		
		second          =       2DIGIT / obs-second
		
		zone            =       (( "+" / "-" ) 4DIGIT) / obs-zone
     * 
     *
     * ////////////////////////////////////////////////////////////////////////
     * ISO 8601
     * http://www.w3.org/TR/NOTE-datetime
     * ////////////////////////////////////////////////////////////////////////
     * 
     * 
     *     Year:
		      YYYY (eg 1997)
		   Year and month:
		      YYYY-MM (eg 1997-07)
		   Complete date:
		      YYYY-MM-DD (eg 1997-07-16)
		   Complete date plus hours and minutes:
		      YYYY-MM-DDThh:mmTZD (eg 1997-07-16T19:20+01:00)
		   Complete date plus hours, minutes and seconds:
		      YYYY-MM-DDThh:mm:ssTZD (eg 1997-07-16T19:20:30+01:00)
		   Complete date plus hours, minutes, seconds and a decimal fraction of a
		second
		      YYYY-MM-DDThh:mm:ss.sTZD (eg 1997-07-16T19:20:30.45+01:00)
		
		where:
		
		     YYYY = four-digit year
		     MM   = two-digit month (01=January, etc.)
		     DD   = two-digit day of month (01 through 31)
		     hh   = two digits of hour (00 through 23) (am/pm NOT allowed)
		     mm   = two digits of minute (00 through 59)
		     ss   = two digits of second (00 through 59)
		     s    = one or more digits representing a decimal fraction of a second
		     TZD  = time zone designator (Z or +hh:mm or -hh:mm)
     */
    /**
     * Constructeur de dates
     * @param arg mêmes arguments que le constructeur natif Date (mais <strong>janvier=1</strong> par défaut, modifiable par la propriété january) ou objet JDate ou objet Date
     * @returns {JDate}
     */
    function JDate(arg) {
		
        if (arg instanceof JDate) this.date = new Date(arg.date.toString());
        else if (arg instanceof Date) this.date = new Date(arg.toString());
        else {
            var a = arguments;
            switch (a.length) { //pas moyen de gruger avec un apply, ni en passant null ou undefined en argument
                case 0 : this.date = new Date(); break;
                case 1 : this.date = new Date(a[0]); break;
                case 2 : this.date = new Date(a[0] , a[1]-this.january); break;
                case 3 : this.date = new Date(a[0] , a[1]-this.january , a[2]); break;
                case 4 : this.date = new Date(a[0] , a[1]-this.january , a[2] , a[3]); break;
                case 5 : this.date = new Date(a[0] , a[1]-this.january , a[2] , a[3] , a[4]); break;
                case 6 : this.date = new Date(a[0] , a[1]-this.january , a[2] , a[3] , a[4], a[5]); break;
                default : throw new Error("Nombre d'arguments incorrect pour le constructeur JDate");
            }
        }
		
        if (isNaN(this.date)) throw new Error(arg+" Date incorrecte");
    }
	
    function getdateMethod(units) {
		
        switch (units.toLowerCase().replace(/s$/,'')) {
            case "millisecond" : return "Milliseconds";
            case "second" : return "Seconds";
            case "minute" : return "Minutes";
            case "hour" : return "Hours";
            case "day" : case "date" : return "Date";
            case "dayofweek" : return "Day";
            case "month" : return "Month";
            case "year" : return "FullYear";
            default : throw new Error(units+" n'est pas une unité correcte"); 
        }
    }
	
    function getIntAndMod(nb) {
		
        var intg = (nb > 0) ? Math.floor(nb) : Math.ceil(nb);
		
        return {
            intg : intg,
            mod : (intg === 0) ? nb : nb % intg
        };
    }
	
    JDate.prototype = {
		
        constructor : JDate,
        /**
         * objet Date original
         */
        date : null,
        /**
         * Exprime ou non les dates en temps universel coordonné
         */
        utc : false,
        /**
         * Langue utilisée (parmi la liste JDate.languages)
         */
        lang : "fr",
        /**
         * Indice pour le mois de janvier (en javascript 0 par défaut)
         */
        january : 1,
        /**
         * Indice pour le dimanche (en javascript 0 par défaut)
         */
        sunday : 7,
		
        /**
         * Récupération d'un paramêtre de la date
         * @param units
         * <ul>
         * <li>milliseconds</li>
         * <li>seconds</li>
         * <li>minutes</li>
         * <li>hours</li>
         * <li>day : jour dans le mois</li>
         * <li>dayOfWeek : numéro du jour de la semaine. Si c'est dimanche, renvoie la propriété "sunday" (7 par défaut, mais 0 en javascript natif)</li>
         * <li>month : numéro du mois, en fonction de la propriété "january" (1 par défaut, mais 0 en javascript natif)</li>
         * <li>year : année sur 4 chiffres</li>
         * </ul>
         * @example <pre>//nous sommes le dimanche 3 janvier
         * var date = new JDate();
         * 
         * date.get('day'); // 3
         *  
         * date.get('dayOfWeek'); // 7 (car date.sunday == 7)
         * date.sunday = 0;
         * date.get('dayOfWeek'); // 0 (comportement par défaut en javascript)
         *  
         * date.get('month'); // 1 (car date.january == 1)
         * date.january = 0;
         * date.get('month'); // 0 (comportement par défaut en javascript)
         */
        get : function(units) {
			
            var method = 'get' + (this.utc ? "UTC" : "") + getdateMethod(units);
			
            var val = this.date[method]();
			
            switch (method) {
                case "getMonth" : case "getUTCMonth" : val+=this.january; break;
                case "getDay" : case "getUTCDay" : if (val === 0) val = this.sunday; break;
            }
			
            return val;
        },
		
        /**
         * définition d'un paramêtre de la date
         * @param units
         * <ul>
         * <li>seconds</li>
         * <li>minutes</li>
         * <li>hours</li>
         * <li>day : jour dans le mois</li>
         * <li>month : numéro du mois, en fonction de la propriété "january" (1 par défaut, mais 0 en javascript natif)</li>
         * <li>year : année sur 4 chiffres</li>
         * </ul>
         * @param val valeur à affecter
         * @example <pre>//nous sommes le dimanche 3 mars
         * var date = new JDate();
         * 
         * date.set('month',1);
         * date.toString('MOIS'); //janvier (car date.january == 1 par défaut)
         * 
         * date.january = 0;
         * date.set('month',1);
         * date.toString('MOIS'); //février (comportement par défaut en javascript)
         */
        set : function(units,val) {

            var method = 'set' + (this.utc ? "UTC" : "") + getdateMethod(units);

            if (method == "setMonth" || method == "setUTCMonth") val-= this.january;

            this.date[method](val);

            return this;
        },

        /**
         * Renvoie une chaîne de caractères au format spécifié
         * @param format Par défaut "JOUR J MOIS ANNEE". Séparateurs au choix<ul>
         * <li>YYYY,YEAR : année sur 4 chiffres</li>
         * <li>YY : année sur 2 chiffres</li>
         * <li>MONTH : nom du mois</li>
         * <li>MM : numéro du mois sur 2 chiffres</li>
         * <li>M : numéro du mois sur 1 ou 2 chiffres</li>
         * <li>DAY : nom du jour de la semaine</li>
         * <li>DD : numéro du jour du mois sur 2 chiffres</li>
         * <li>D : numéro du jour du mois sur 1 ou 2 chiffres</li>
         * <li>HH : heure sur 2 chiffres (00 à 23)</li>
         * <li>H : heure sur 1 ou 2 chiffres (0 à 23)</li>
         * <li>MI : minutes sur 2 chiffres</li>
         * <li>I : minutes sur 1 ou 2 chiffres</li>
         * <li>SS : secondes sur 2 chiffres</li>
         * <li>S : secondes sur 1 ou 2 chiffres</li>
         * </ul>
         * @example <pre>var date = new JDate();
         * date.toString(); //lundi 3 septembre 2012
         * date.toString("HH:MI:SS DD/MM/YYYY"); //11:47:33 03 septembre 2012
         * </pre>
         * @returns {String}
         */
        toString : function(format) {

            format = format || "DAY D MONTH YEAR";

            var lang = JDate.languages[this.lang];
            if (!lang) throw new Error(this.lang+" : langue inconnue");

            var jour = this.get("day"),
            mois = this.get("month"),
            annee = this.get("year"),

            heure = this.get("hours"),
            minutes = this.get("minutes"),
            secondes = this.get("seconds"),
            millisecondes = this.get("milliseconds"),

            replace = {
                YYYY : annee,
                YEAR : annee,
                MONTH : lang.months[ this.date['get'+ (this.utc ? "UTC" : "") + "Month"]() ],
                DAY : lang.days[ this.date['get'+ (this.utc ? "UTC" : "") + "Day"]() ],
                MSS : (millisecondes < 100 ? '0' : (millisecondes < 10) ? '0' : '') + millisecondes,
                YY : annee.toString().substr(2),
                MM : (mois < 10 ? '0' : '') + mois,
                DD : (jour < 10 ? '0' : '') + jour,
                HH : (heure < 10 ? '0' : '') + heure,
                MI : (minutes < 10 ? '0' : '') + minutes,
                SS : (secondes < 10 ? '0' : '') + secondes,
                MS : millisecondes, 
                S : secondes,
                I : minutes,
                H : heure,
                M : mois,
                D : jour
            },

            n=null;

            for (n in replace) format = format.replace(n,replace[n]);

            return format;
        },

        /**
         * Teste si la date correspond à un jour ferié
         * @returns {Boolean}
         */
        isOff : function() {

            var lang = JDate.languages[this.lang];
            if (!lang) throw new Error(this.lang+" : langue inconnue");
            return lang.off.indexOf(this.toString("M-D")) !== -1;
        },

        /**
         * Teste si le jour est le même que celui de la date passée en argument
         * @returns {Boolean}
         */
        isSameDay : function(date) {
            date = new JDate(date).date;
            var date2 = this.date;
            return (date.getDate() === date2.getDate() && date.getMonth() === date2.getMonth() && date.getFullYear() === date2.getFullYear() );
        },

        /**
         * Teste si la date correspond au jour d'aujourd'hui
         * @returns {Boolean}
         */
        isToday : function() {
            return this.isSameDay(new Date());
        },

        /**
         * Teste si la date est un samedi ou dimanche
         * @returns {Boolean}
         */
        isWe : function() {
            return [0,6].indexOf(this.date.getDay()) !== -1;
        },

        /**
         * Ajoute un nombre donné d'unités à la date.
         * @param units type d'unités ajoutées ('milliseconds','seconds','minutes','hours','days','months','years'), insensible à la casse et au "s" final.
         * @param nb nombre entier ou décimal, positif ou négatif.
         * <br/><br/>
         * On peut aussi passer en argument une chaîne de caractères unique de type "nb1 units1 nb2 units2".
         * @example <pre>
         * var date = new JDate();
         * date.add("days",1).add("months",2);
         * //Equivalent à 
         * date.add("1 day 2 months");
         * </pre>
         * @returns {JDate}
         */
        add : function(units,nb) {

            if (nb == null) {

                var args = units.split(/\s+/),
                i=0,N=args.length;

                for (;i<N;i+=2) this.add(args[i+1],args[i]);

                return this;
            }

            var val = getIntAndMod(nb);

            switch ( units.toLowerCase().replace(/s$/i,'') ) {

                case "millisecond" :
                    this.date.setMilliseconds(this.date.getMilliseconds() + val.intg);
                    break;

                case "second" :
                    this.date.setSeconds(this.date.getSeconds() + val.intg);
                    if (val.mod !== 0) this.add("milliseconds", Math.round(val.mod * 1000) );
                    break;

                case "minute" :
                    this.date.setMinutes(this.date.getMinutes() + val.intg);
                    if (val.mod !== 0) this.add("seconds", Math.round(val.mod * 60) );
                    break;

                case "hour" :
                    this.date.setHours(this.date.getHours() + val.intg);
                    if (val.mod !== 0) this.add("minutes", Math.round(val.mod*60) );
                    break;

                case "day" :
                    this.date.setDate(this.date.getDate() + val.intg);
                    if (val.mod !== 0) this.add("hours", Math.round(val.mod*24) );
                    break;

                case "week" :
                    return this.add("days",nb*7);

                case "month" :

                    var day = this.get("day"),
                    month = this.get("month"),
                    nbdays = day <= 28 ? 31 : this.clone().set("day",1).set("month", month + val.intg ).daysInMonth();

                    if (day > nbdays) this.set("day",1);

                    this.set("month", month + val.intg );

                    if (day > nbdays) this.set("day",nbdays);

                    if (val.mod !== 0) this.add("days", Math.round(val.mod*30) );

                    break;

                case "year" :
                    this.date.setFullYear(this.date.getFullYear() + val.intg);
                    if (val.mod !== 0) this.add("days", Math.round(val.mod*365) );
                    break;

                default : throw new Error(units+" : unité inconnue");
            }

            return this;
        },

        daysInMonth : function() {

            return new Date( this.date.getYear() , this.date.getMonth()+1 , 0 ).getDate();
        },

        daysInYear : function () {

            return this.isLeapYear() ? 366 : 365;
        },

        isLeapYear : function() {

            var year = this.get("year");

            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },

        /**
         * Recale à 0 
         * @param unit ('milliseconds','seconds','minutes','hours','days','months','years')
         * @returns {JDate}
         * @example
         * new JDate("2012-12-15T23:25:00").reset("day").toString("DD/MM HH:MI:SS"); //15/12 00:00:00
         * new JDate("2012-12-15T23:25:00").reset("month").toString("DD/MM HH:MI:SS"); //01/12 00:00:00
         */
        reset : function(unit) {

            unit = unit.toLowerCase().replace(/s$/i,''); 

            this.set("millisecond",0);

            if (unit == "second") return this;

            this.set("second",0);

            if (unit == "minute") return this;

            this.set("minute",0);

            if (unit == "hour") return this;

            this.set("hour",0);

            if (unit == "day") return this;

            this.set("day",1);

            if (unit == "month") return this;

            this.set("month",this.january);

            if (unit == "year") return this;

            throw new Error(unit+" unité incorrecte");
        },
		
        /**
         * Renvoie la date sous forme de timestamp
         * @returns {Number}
         */
        timestamp : function() { return +this.date; },

        /**
         * Renvoie le décalage UTC
         */
        utcOffset : function() {

            return this.date.getHours() - this.date.getUTCHours();
        },

        clone : function() { return new JDate(+this.date); }
    };
	
    /**
     * Liste des langues pour les dates
     */
    JDate.languages = {

        "fr" : {
            months : ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
            days : ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],
            off : ["1-1","5-1","5-8","7-14","8-15","11-1","11-11","12-25"] //jour fériés
        },

        "en" : {
            months : ["january","february","march","april","may","june","july","august","september","november","december"],
            days : ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],
            off : []
        }
    };

    if (typeof JSYG != "undefined") JSYG.Date = JDate;

    if (typeof module === "object" && typeof module.exports === "object") module.exports = JDate;
    else if (typeof define == 'function' && define.amd) define(function() { return JDate; });
    else if (typeof JSYG == "undefined") this.JDate = JDate;

}).call(this);
