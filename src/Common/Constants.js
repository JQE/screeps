module.exports = {
    ROLES: {
        "FARMER"        :   require('Roles_Farmer'),
        "UPGRADER"      :   require('Roles_Upgrader'),
        "BUILDER"       :   require('Roles_Builder'),
        "MECHANIC"      :   require('Roles_Mechanic'),
        "TRANSPORT"     :   require('Roles_Transport'),
        "MINER"         :   require('Roles_Miner'),
        "HARVESTER"     :   require('Roles_Harvester'),
        "DEFENDER"      :   require('Roles_Defender')
    },
    SPAWN_LIST : [
        "TRANSPORT","HARVESTER","UPGRADER","BUILDER","MECHANIC"
    ],
    REMOTE_ROLES: {
        "RMINER"        :   require('Roles_Remote_Miner'),
        "RBUILDER"      :   require('Roles_Remote_Builder'),
        "RRESERVER"     :   require('Roles_Remote_Reserver'),
        "RTRANSPORT"    :   require('Roles_Remote_Transport')
    }
}