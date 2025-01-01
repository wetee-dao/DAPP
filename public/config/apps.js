const temps = [
    {
        "name": "Hummingbot",
        "containers": [
            { "name": "Hummingbot" },
        ]
    },
    {
        "name": "Gitea",
        "containers": [
            { "name": "Gitea" },
        ]
    },
    {
        "name": "Evershop",
        "containers": [
            { "name": "Evershop" },
            { "name": "Postgres16" },
        ]
    },
    {
        "name": "Substrate",
        "containers": [
            { "name": "Substrate" },
        ]
    },
    {
        "name": "Code-server",
        "containers": [
            { "name": "Code-server" },
        ]
    },
    {
        "name": "Apache Answer",
        "containers": [
            {
                "name": "Apache Answer",
            }
        ]
    },
    {
        "name": "LiveKitMeet",
        "containers": [
            {
                "name": "LiveKitMeet",
                "port": [
                    { "key": "ProjectTcp", "value": 7860 },
                    { "key": "Tcp", "value": 0 },
                    { "key": "Tcp", "value": 0 },
                ],
                "env": [
                    { "key": "ser_port", "value": "7860" },
                    { "key": "tcp_port", "value": "{{.ser_0_nodeport}}" },
                    { "key": "udp_port", "value": "{{.ser_1_nodeport}}" }
                ]
            },
            {
                "name": "LiveKitMeet UI",
                "port": [],
                "env": [
                    { "key": "LIVEKIT_API_KEY", "value": "APITnzNEjYyh5VB" },
                    { "key": "LIVEKIT_API_SECRET", "value": "160fDb8raaVh6q292VjhVOZq6lKIWBxaRpm5nAQqEuU" },
                    { "key": "LIVEKIT_URL", "value": "https://{{.cluster_domain}}:{{.ser_2_nodeport}}" },
                    { "key": "NEXT_PUBLIC_LK_TOKEN_ENDPOINT", "value": "/api/token" },
                    { "key": "HOSTNAME", "value": "0.0.0.0" }
                ]
            },
            {
                "name": "SSL Proxy",
                "port": [
                    { "key": "Tcp", "value": 433 },
                ],
                "env": [
                    { "key": "TO", "value": "127.0.0.1:7860" },
                    { "key": "KEY", "value": "{{.gen_ssl}}" },
                    { "key": "PORT", "value": "433" },
                ],
            },
            {
                "name": "SSL Proxy",
                "port": [
                    { "key": "Tcp", "value": 443 },
                ],
                "env": [
                    { "key": "TO", "value": "127.0.0.1:3000" },
                    { "key": "KEY", "value": "{{.gen_ssl}}" },
                    { "key": "PORT", "value": "443" },
                ],
            },
        ]
    },
    {
        "name": "Stable Diffusion",
        "containers": [
            { "name": "Stable Diffusion" },
        ]
    },
    {
        "name": "Ollama",
        "containers": [
            { "name": "Ollama" },
        ]
    },
    {
        "name": "Golang http server",
        "containers": [
            { "name": "Golang" },
        ]
    },
    {
        "name": "Rust",
        "containers": [
            { "name": "Rust" },
        ]
    },
    {
        "name": "Python",
        "containers": [
            { "name": "Python" },
        ]
    },
    {
        "name": "NodeJS",
        "containers": [
            { "name": "NodeJS" },
        ]
    },
    {
        "name": "Nginx - SGX",
        "containers": [
            { "name": "Nginx/C++ - SGX" },
        ]
    },
    {
        "name": "Nginx - CVM",
        "containers": [
            { "name": "Nginx/C++ - CVM" },
        ]
    },
    {
        "name": "Twentycrm",
        "containers": [
            { "name": "Twentycrm" },
            { "name": "Postgres" },
        ]
    },
    {
        "name": "Strfry - Nostr",
        "containers": [
            { "name": "Strfry - Nostr" },
        ]
    },
    {
        "name": "Snort - Nostr",
        "containers": [
            { "name": "Snort - Nostr" },
        ]
    },
    {
        "name": "Minecraft-server",
        "containers": [
            { "name": "Minecraft-server" },
        ]
    }
];

const teeApps = [{
    "name": "Gitea",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://about.gitea.com/gitea.svg",
    "desc": "Brings teams and developers high-efficiency but easy operations from planning to production. ",
    "type": "Tools",
    "github": "https://github.com/go-gitea/gitea",
    "home": "https://about.gitea.com/",
    "docker": {
        "image": "gitea/gitea:1.21.11",
        "port": [{
            "key": "Tcp",
            "value": 3000
        },
        {
            "key": "Tcp",
            "value": 22
        }],
        "disk": [{
            "key": "/data",
            "value": 1
        }]
    }
},
{
    "name": "LiveKitMeet",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://docs.livekit.io/_next/static/media/livekit-logo-grid.63920107.svg",
    "desc": "Real-time Video, Audio, & Data",
    "type": "Tools",
    "github": "https://github.com/livekit/livekit",
    "home": "https://docs.livekit.io/realtime/",
    "docker": {
        "image": "wetee/cvm-livekit-server:2024-05-06-07-56",
        "port": [{
            "key": "Tcp",
            "value": 0
        },
        {
            "key": "Tcp",
            "value": 0
        },
        {
            "key": "Tcp",
            "value": 0
        }],
        "env": [{
            "key": "ser_port",
            "value": "{{.ser_0_nodeport}}"
        },
        {
            "key": "tcp_port",
            "value": "{{.ser_1_nodeport}}"
        },
        {
            "key": "udp_port",
            "value": "{{.ser_2_nodeport}}"
        }]
    }
},
{
    "name": "LiveKitMeet UI",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://docs.livekit.io/_next/static/media/livekit-logo-grid.63920107.svg",
    "desc": "Real-time Video, Audio, & Data",
    "type": "Tools",
    "github": "https://github.com/livekit/livekit",
    "home": "https://docs.livekit.io/realtime/",
    "docker": {
        "image": "wetee/cvm-livekit-ui:2024-05-18-09-29",
        "port": [{
            "key": "Tcp",
            "value": 3000
        }],
        "env": [{
            "key": "LIVEKIT_API_KEY",
            "value": "APITnzNEjYyh5VB"
        },
        {
            "key": "LIVEKIT_API_SECRET",
            "value": "160fDb8raaVh6q292VjhVOZq6lKIWBxaRpm5nAQqEuU"
        },
        {
            "key": "LIVEKIT_URL",
            "value": ""
        },
        {
            "key": "NEXT_PUBLIC_LK_TOKEN_ENDPOINT",
            "value": "/api/token"
        },
        {
            "key": "HOSTNAME",
            "value": "0.0.0.0"
        }]
    }
},
{
    "name": "Mysql",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://labs.mysql.com/common/logos/mysql-logo.svg",
    "desc": "MySQL is a widely used, open-source relational database management system (RDBMS).",
    "type": "Tools",
    "github": "https://github.com/docker-library/mysql",
    "home": "https://www.mysql.com/",
    "docker": {
        "image": "mysql:8.0",
        "port": [{
            "key": "Tcp",
            "value": 3306
        }],
        "disk": [{
            "key": "/var/lib/mysql",
            "value": 1
        }],
        "env": [{
            "key": "MYSQL_ROOT_PASSWORD",
            "value": "123456"
        }]
    }
},
{
    "name": "Mysql 5.7",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://labs.mysql.com/common/logos/mysql-logo.svg",
    "desc": "MySQL is a widely used, open-source relational database management system (RDBMS).",
    "type": "Tools",
    "github": "https://github.com/docker-library/mysql",
    "home": "https://www.mysql.com/",
    "docker": {
        "image": "mysql:5.7.39",
        "port": [{
            "key": "Tcp",
            "value": 3306
        }],
        "disk": [{
            "key": "/var/lib/mysql",
            "value": 1
        }],
        "env": [{
            "key": "MYSQL_ROOT_PASSWORD",
            "value": "123456"
        }]
    }
},
{
    "name": "Mariadb",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://hub.docker.com/api/media/repos_logo/v1/library%2Fmariadb",
    "desc": "MariaDB Server is a high performing open source relational database, forked from MySQL.",
    "type": "Tools",
    "github": "https://github.com/MariaDB/mariadb-docker",
    "home": "https://mariadb.org/",
    "docker": {
        "image": "mariadb:11.3",
        "port": [{
            "key": "Tcp",
            "value": 3306
        }],
        "disk": [{
            "key": "/var/lib/mysql",
            "value": 1
        }],
        "env": [{
            "key": "MARIADB_ROOT_PASSWORD",
            "value": "123456"
        }]
    }
},
{
    "name": "Redis",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://redis.io/wp-content/uploads/2024/04/Logotype.svg?auto=webp&quality=85,75&width=120",
    "desc": "Get the world’s fastest in-memory database from the ones who built it.",
    "type": "Tools",
    "github": "https://github.com/redis/redis",
    "home": "https://redis.io/",
    "docker": {
        "image": "redis:7.2.4",
        "port": [{
            "key": "Tcp",
            "value": 6379
        }]
    }
},
{
    "name": "Stable Diffusion",
    "create_type": "gpu",
    "runtime": "CVM",
    "icon": "https://dapp.wetee.app/apps/Stable_Diffusion.png",
    "desc": "Latent text-to-image diffusion model for photo-realistic image generation",
    "type": "AI",
    "github": "https://github.com/AUTOMATIC1111/stable-diffusion-webui",
    "home": "https://stability.ai/",
    "docker": {
        "image": "wetee/sd-webui:2024-3-21",
        "port": [{
            "key": "Tcp",
            "value": 7860
        }],
        "env": [{
            "key": "COMMANDLINE_ARGS",
            "value": " --no-half-vae --share --xformers "
        }],
        "meta": {
            "ai-model": "sd"
        }
    }
},
{
    "name": "Ollama",
    "create_type": "gpu",
    "runtime": "CVM",
    "icon": "https://dapp.wetee.app/apps/Ollama.png",
    "desc": "Run Llama 3, Phi 3, Mistral, Gemma, and other models. Customize and create your own. ",
    "type": "AI",
    "github": "https://github.com/ollama/ollama",
    "home": "https://ollama.com/",
    "docker": {
        "image": "backplane/open-webui:0.1.124-ollama",
        "port": [{
            "key": "Tcp",
            "value": 8080
        }],
        "env": [],
        "meta": {
            "ai-model": "ollama"
        }
    }
},
{
    "name": "Hummingbot",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://dapp.wetee.app/apps/hummingbot.png",
    "desc": "The open source, community-owned framework for crypto",
    "type": "Tools",
    "github": "https://github.com/hummingbot/hummingbot",
    "home": "https://hummingbot.org/",
    "docker": {
        "image": "hummingbot/hummingbot:latest",
        "port": []
    }
},
{
    "name": "Golang",
    "create_type": "service",
    "runtime": "SGX",
    "icon": "https://dapp.wetee.app/apps/golang.png",
    "desc": "An open-source programming language supported by Google，Build simple, secure, scalable systems with Go",
    "type": "Language Template",
    "github": "https://github.com/wetee-dao/examples/tree/main/ego-http-server",
    "home": "https://go.dev/",
    "docker": {
        "image": "registry.cn-hangzhou.aliyuncs.com/wetee_dao/ego-hello:2024-08-25-11-49",
        "port": [{
            "key": "Tcp",
            "value": 8999
        }]
    }
},
{
    "name": "Rust",
    "create_type": "task",
    "runtime": "SGX",
    "icon": "https://dapp.wetee.app/apps/Rust.png",
    "desc": "A language empowering everyoneto build reliable and efficient software",
    "type": "Language Template",
    "github": "https://github.com/wetee-dao/examples/tree/main/gramine-rust",
    "home": "https://www.rust-lang.org/",
    "docker": {
        "image": "wetee/grust:2024-03-09-08-49"
    }
},
{
    "name": "Python",
    "create_type": "task",
    "runtime": "SGX",
    "icon": "https://dapp.wetee.app/apps/Python.png",
    "desc": "Python is a programming language that lets you work quickly and integrate systems more effectively",
    "type": "Language Template",
    "github": "https://github.com/wetee-dao/examples/tree/main/gramine-python",
    "home": "https://www.python.org/",
    "docker": {
        "image": "wetee/gpython:2024-03-09-09-21"
    }
},
{
    "name": "Nginx/C++ - SGX",
    "create_type": "service",
    "runtime": "SGX",
    "icon": "https://dapp.wetee.app/apps/Nginx.png",
    "desc": "Nginx (pronounced engine x) is open source Web server",
    "type": "Language Template",
    "github": "https://github.com/wetee-dao/examples/tree/main/gramine-nginx",
    "home": "https://www.nginx.com/",
    "docker": {
        "image": "wetee/gnginx:2024-03-09-07-53",
        "port": [{
            "key": "Tcp",
            "value": 80
        }]
    }
},
{
    "name": "Nginx/C++ - CVM",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://dapp.wetee.app/apps/Nginx.png",
    "desc": "Nginx (pronounced engine x) is open source Web server",
    "type": "Language Template",
    "github": "https://github.com/wetee-dao/examples/tree/main/gramine-nginx",
    "home": "https://www.nginx.com/",
    "docker": {
        "image": "nginx:alpine",
        "port": [{
            "key": "Tcp",
            "value": 80
        }]
    }
},
{
    "name": "NodeJS",
    "create_type": "task",
    "runtime": "SGX",
    "icon": "https://dapp.wetee.app/apps/Node.png",
    "desc": "Node.js® is a free, open-source, cross-platform JavaScript runtime",
    "type": "Language Template",
    "github": "https://github.com/wetee-dao/examples/tree/main/gramine-nodejs",
    "home": "https://nodejs.org/",
    "docker": {
        "image": "wetee/gnodejs:2024-03-09-07-53"
    }
},
{
    "name": "Twentycrm",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://twenty.com/images/core/logo.svg",
    "desc": "Open-Source CRM",
    "type": "Tools",
    "github": "https://github.com/twentyhq/twenty",
    "home": "https://twenty.com/",
    "docker": {
        "image": "wetee/twenty:2024-05-15-18-49",
        "port": [{
            "key": "Tcp",
            "value": 0
        }],
        "env": [{
            "key": "PORT",
            "value": "{{.ser_0_nodeport}}"
        },
        {
            "key": "PG_DATABASE_URL",
            "value": "postgres://postgres:123456@127.0.0.1:5432/postgres"
        },
        {
            "key": "SERVER_URL",
            "value": "http://xiaobai.asyou.me:{{.ser_0_nodeport}}"
        },
        {
            "key": "FRONT_BASE_URL",
            "value": "http://0.0.0.0:{{.ser_0_nodeport}}"
        },
        {
            "key": "SIGN_IN_PREFILLED",
            "value": "true"
        },
        {
            "key": "STORAGE_TYPE",
            "value": "local"
        },
        {
            "key": "ACCESS_TOKEN_SECRET",
            "value": "123456"
        },
        {
            "key": "LOGIN_TOKEN_SECRET",
            "value": "123456"
        },
        {
            "key": "REFRESH_TOKEN_SECRET",
            "value": "123456"
        },
        {
            "key": "FILE_TOKEN_SECRET",
            "value": "123456"
        },
        {
            "key": "POSTGRES_PASSWORD",
            "value": "123456"
        }],
    }
},
{
    "name": "Postgres",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://hub.docker.com/api/media/repos_logo/v1/library%2Fpostgres",
    "desc": "object-relational database system provides reliability and data integrity.",
    "type": "Tools",
    "github": "https://github.com/docker-library/docs/tree/master/postgres/README.md",
    "home": "https://hub.docker.com/_/postgres",
    "docker": {
        "image": "postgres:15",
        "env": [{
            "key": "POSTGRES_PASSWORD",
            "value": "123456"
        }],
        "disk": [],
    }
},
{
    "name": "Postgres16",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://hub.docker.com/api/media/repos_logo/v1/library%2Fpostgres",
    "desc": "object-relational database system provides reliability and data integrity.",
    "type": "Tools",
    "github": "https://github.com/docker-library/docs/tree/master/postgres/README.md",
    "home": "https://hub.docker.com/_/postgres",
    "docker": {
        "image": "postgres:16",
        "env": [{
            "key": "POSTGRES_PASSWORD",
            "value": "123456"
        }],
        "disk": [],
    }
},
{
    "name": "Strfry - Nostr",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://djeqr6to3dedg.cloudfront.net/repo-logos/dockurr/strfry/live/logo-1702170756243.png",
    "desc": "Nostr relay server in a Docker container.",
    "type": "Social",
    "github": "https://github.com/hoytech/strfry",
    "home": "https://github.com/hoytech/strfry",
    "docker": {
        "image": "wetee/strfry:2024-05-16-12-32",
        "env": [],
        "disk": [{
            "key": "/app/strfry-db",
            "value": 1
        }],
    }
},
{
    "name": "Snort - Nostr",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://djeqr6to3dedg.cloudfront.net/repo-logos/dockurr/snort/live/logo-1702170912561.png",
    "desc": "Nostr web UI (snort.social)",
    "type": "Social",
    "github": "https://git.v0l.io/Kieran/snort",
    "home": "https://git.v0l.io/Kieran/snort",
    "docker": {
        "image": "dockurr/snort:latest",
        "env": [],
        "port": [{
            "key": "Tcp",
            "value": 8080
        }]
    }
},
{
    "name": "Minecraft-server",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://dapp.wetee.app/apps/minecraft-server.jpeg",
    "desc": "Minecraft server with dynamic version, server types, and modpack support",
    "type": "Game",
    "github": "https://github.com/itzg/docker-minecraft-server",
    "home": "https://github.com/itzg/docker-minecraft-server",
    "docker": {
        "image": "itzg/minecraft-server:latest",
        "env": [{
            "key": "EULA",
            "value": "true"
        }],
        "port": [{
            "key": "Tcp",
            "value": 25565
        }],
        "disk": [{
            "key": "/data",
            "value": 1
        }],
    }
},
{
    "name": "Substrate",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://dapp.wetee.app/apps/substrate.png",
    "desc": "Substrate framework for building blockchains.",
    "type": "Chain",
    "github": "https://github.com/substrate-developer-hub",
    "home": "https://substrate.io",
    "docker": {
        "image": "wetee/wetee-node:dev.2024-05-18-13_11",
        "port": [{
            "key": "Tcp",
            "value": 9944
        }],
    }
},
{
    "name": "SSL Proxy",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "",
    "desc": "Simple zero-config SSL reverse proxy ",
    "type": "Tools",
    "github": "https://github.com/suyashkumar/ssl-proxy",
    "home": "https://github.com/suyashkumar/ssl-proxy",
    "docker": {
        "image": "wetee/cvm-ssl-proxy:2024-05-18-11-47",
        "env": [{
            "key": "TO",
            "value": ""
        },
        {
            "key": "KEY",
            "value": ""
        },
        {
            "key": "PORT",
            "value": "443"
        }],
        "port": [{
            "key": "Tcp",
            "value": 443
        }],
    }
},
{
    "name": "Code-server",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://www.gravatar.com/avatar/4c9dd1fd94cb9c193bbca99a70bba51c?s=120&r=g&d=404",
    "desc": "Self-hosted enterprise dev environments.",
    "type": "Tools",
    "github": "https://github.com/coder/code-server",
    "home": "https://coder.com/",
    "docker": {
        "image": "codercom/code-server:latest",
        "env": [{
            "key": "PASSWORD",
            "value": "123456"
        }],
        "port": [{
            "key": "Tcp",
            "value": 8080
        }],
        "cmdPre": "SH",
        "cmd": "mkdir -p /home/coder/workspace && /usr/bin/entrypoint.sh --bind-addr 0.0.0.0:8080 /home/coder/workspace"
    }
},
{
    "name": "Apache Answer",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://dapp.wetee.app/apps/alogo.svg",
    "desc": "A Q&A platform software for teams at any scales.",
    "type": "Tools",
    "github": "https://github.com/apache/incubator-answer",
    "home": "https://answer.apache.org",
    "docker": {
        "image": "apache/answer:latest",
        "disk": [{
            "key": "/data",
            "value": 1
        }],
        "port": [{
            "key": "Tcp",
            "value": 80
        }],
    }
},
{
    "name": "Evershop",
    "create_type": "service",
    "runtime": "CVM",
    "icon": "https://dapp.wetee.app/apps/evershop.png",
    "desc": "Open-Source NodeJS Ecommerce Platform.",
    "type": "Tools",
    "github": "https://github.com/evershopcommerce/evershop",
    "home": "https://evershop.io",
    "docker": {
        "image": "evershop/evershop:latest",
        "port": [{
            "key": "Tcp",
            "value": 3000
        }],
        "env": [{
            "key": "DB_HOST",
            "value": "127.0.0.1"
        },
        {
            "key": "DB_PORT",
            "value": "5432"
        },
        {
            "key": "DB_PASSWORD",
            "value": "123456"
        },
        {
            "key": "DB_USER",
            "value": "postgres"
        },
        {
            "key": "DB_NAME",
            "value": "postgres"
        }],
    }
},
];

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function extTemps() {
    return deepCopy(temps).map((temp) => {
        let mainData = null
        
        temp.containers = temp.containers.map((c, i) => {
            let item = deepCopy(teeApps).find((a) => a.name === c.name)
            if (!item) {
                return null
            }
            if (i == 0) {
                mainData = item
            }

            if (c.env) {
                item.docker.env = c.env
            }

            if (c.port) {
                item.docker.port = c.port
            }

            if (c.disk) {
                item.docker.disk = c.disk
            }

            if (c.cmd) {
                item.docker.cmd = c.cmd
                item.docker.cmdPre = c.cmdPre
            }

            let v = {};
            if (item.docker.cmd) {
                v.commandPrefix = item.docker.cmdPre;
                v.command = item.docker.cmd;
            } else {
                v.commandPrefix = "SH"
                v.command = "";
            }

            if (item.docker.port) {
                let ports = []
                for (let i = 0; i < item.docker.port.length; i++) {
                    ports.push({
                        prefix: item.docker.port[i].key,
                        value: item.docker.port[i].value
                    })
                }
                v.port = ports;
            } else {
                v.port = []
            }

            if (item.docker.disk) {
                let disks = []
                for (let i = 0; i < item.docker.disk.length; i++) {
                    disks.push({
                        prefix: "SSD",
                        key: item.docker.disk[i].key,
                        value: item.docker.disk[i].value
                    })
                }
                v.disk = disks;
            } else {
                v.disk = []
            }

            if (item.docker.env) {
                let envs = []
                for (let i = 0; i < item.docker.env.length; i++) {
                    envs.push({
                        prefix: "Env",
                        key: item.docker.env[i].key,
                        value: item.docker.env[i].value
                    })
                }
                v.env = envs;
            } else {
                v.env = []
            }

            v.image = item.docker.image;
            v.name = item.name;
            v.teeVersion = item.runtime;
            v.level = 1;
            v.cpu = 1000;
            v.memory = 800;
            v.github = item.docker.github
            v.meta = item.docker.meta
            if (item.create_type == "gpu") {
                v.cpu = 4000;
                v.memory = 8000;
            }
            v.gpu = 1;

            return v
        })
        temp.icon = mainData.icon
        temp.desc = mainData.desc
        temp.type = mainData.type
        temp.github = mainData.github
        temp.home = mainData.home
        temp.teeVersion = mainData.runtime
        temp.create_type = mainData.create_type

        return temp
    });
}

window.extTemps = extTemps;
window.teeApps = teeApps;