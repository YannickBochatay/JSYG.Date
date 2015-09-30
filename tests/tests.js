if (typeof require!= "undefined") {
    
    require.config({
        paths: {
            "jsyg-date": '../JSYG.Date'
        },
        urlArgs: "bust=" + (+new Date())
    });
}

(function(factory) {
    
    if (typeof define == 'function' && define.amd) define(["jsyg-date"],factory);
    else factory(JDate);
    
}(function(JDate) {

    module("Date");

    test("Manipulation d'une date", function() {     
        
        var date = new JDate();
        
        date.set("month","01");
        date.set("day","01");
        date.set("year","2015");
        
        expect(4);
        
        equal( date.get("month"), 1, "récupération du mois");
        equal( date.get("year"), 2015, "récupération de l'année");
        
        equal( date.add("1 month").get("month") , 2, "ajout d'un mois");
        equal( date.add("-1 day").get("month"), 1, "retrait d'un jour");
    });
    
}));
