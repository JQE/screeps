module.exports = {
    ROLES: {
        "FARMER"        :   require('Roles_Farmer'),
        "UPGRADER"      :   require('Roles_Upgrader'),
        "BUILDER"       :   require('Roles_Builder'),
        "MECHANIC"      :   require('Roles_Mechanic'),
        "TRANSPORT"     :   require('Roles_Transport'),
        "MINER"         :   require('Roles_Miner'),
        "HARVESTER"     :   require('Roles_Harvester')
    },
    SPAWN_LIST : [
        "TRANSPORT","HARVESTER","UPGRADER","BUILDER","MECHANIC"
    ]
}