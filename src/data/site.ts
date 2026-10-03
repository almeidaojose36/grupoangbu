/* Single source of truth for the site's content (from the Company Profile). */

export const FOUNDED = 2017
export const yearsActive = () => new Date().getFullYear() - FOUNDED

export const LOGO = '/brand/angbu-logo.webp'

export const contact = {
    email: 'angbu@grupoangbu.com',
    phones: ['+244 946 503 710', '+244 913 226 684', '+244 927 919 117', '+244 990 919 117'],
    address: 'Bairro Deolinda Rodrigues, Rua Gago Coutinho',
    city: 'Cabinda, Angola',
}

export const tel = (n: string) => `tel:${n.replace(/\s/g, '')}`

export type Stat = { value: number; prefix?: string; suffix?: string; label: string }
export type Service = { title: string; desc?: string }

export type Company = {
    slug: string
    name: string
    fullName: string
    sector: string
    year: number
    media: string // key in /public/media
    hasVideo: boolean
    summary: string
    highlights: string[]
    tagline: string
    statement: string
    paragraphs: string[]
    stats: { value: string; label: string }[]
    servicesTitle: string
    services: Service[]
    listTitle?: string
    list?: string[]
    bandQuote: string
}

export const companies: Company[] = [
    {
        slug: 'cab-racao',
        name: 'Cab-Ração',
        fullName: 'Cab-Ração',
        sector: 'Nutrição animal',
        year: 2021,
        media: 'cabracao',
        hasVideo: true,
        summary:
            'Fábrica licenciada de rações para aves, suínos, caprinos, bovinos e peixes, com capacidade de 10 toneladas por dia.',
        highlights: ['10 toneladas de produção diária', '110+ clientes regulares', 'Lançamento acompanhado pela TPA'],
        tagline: 'Alimentando o futuro da pecuária angolana.',
        statement:
            'Rações balanceadas para todas as fases de desenvolvimento, com ingredientes rigorosamente seleccionados.',
        paragraphs: [
            'A Cab-Ração, fundada em 2021, é uma fábrica licenciada para a produção de rações animais de alta qualidade, adaptadas para todas as fases de desenvolvimento de diversas espécies.',
            'Com uma capacidade de produção diária de 10 toneladas, a Cab-Ração atende uma média de 110 clientes regularmente. O seu lançamento contou com a presença da Televisão Pública de Angola (TPA), reforçando a importância da empresa no sector agropecuário.',
        ],
        stats: [
            { value: '10 t', label: 'Capacidade diária' },
            { value: '110+', label: 'Clientes regulares' },
        ],
        servicesTitle: 'Espécies atendidas',
        services: [
            { title: 'Aves', desc: 'Rações para frangos, galinhas poedeiras e pintos.' },
            { title: 'Suínos', desc: 'Nutrição completa para todas as fases.' },
            { title: 'Caprinos', desc: 'Formulações para um crescimento saudável.' },
            { title: 'Bovinos', desc: 'Rações balanceadas para gado.' },
            { title: 'Peixes', desc: 'Alimentação especializada para aquicultura.' },
        ],
        listTitle: 'Os nossos clientes',
        list: [
            'Grupo Apolónia',
            'AGN',
            'ADMC (Administração Municipal de Cabinda)',
            'ADMC (Administração de Cacongo)',
            'Cooperativa Befu e Befu',
            'CIMAC',
        ],
        bandQuote: 'Alimentando o futuro.',
    },
    {
        slug: 'tchiowa-net',
        name: 'Tchiowa Net',
        fullName: 'Tchiowa Net',
        sector: 'Internet',
        year: 2020,
        media: 'tchiowanet',
        hasVideo: true,
        summary:
            'Internet de alta velocidade para empresas, instituições e residências em Cabinda e no Soyo.',
        highlights: ['TPA, ADMC, Toyota, G4S e mais', 'Instalação profissional em fibra e rádio', 'Suporte técnico 24/7'],
        tagline: 'Internet de alta velocidade em Cabinda e no Soyo.',
        statement: 'Velocidade, estabilidade e suporte técnico de excelência para quem não pode parar.',
        paragraphs: [
            'Fundada em 2020, a Tchiowa Net é especializada no fornecimento de serviços de internet em Cabinda e, desde Outubro de 2025, também no Soyo, província do Zaire.',
            'O nosso objectivo é expandir continuamente a nossa rede, garantindo que os nossos clientes tenham acesso a soluções de internet de vanguarda que atendam às suas necessidades digitais.',
        ],
        stats: [
            { value: '24/7', label: 'Suporte técnico' },
            { value: '99,9%', label: 'Uptime garantido' },
        ],
        servicesTitle: 'Serviços',
        services: [
            { title: 'Internet corporativa de alta capacidade' },
            { title: 'Planos residenciais rápidos e fiáveis' },
            { title: 'Instalação profissional em fibra e rádio' },
            { title: 'Redundância de links para empresas' },
            { title: 'Consultoria em redes e infraestrutura' },
        ],
        listTitle: 'Portfólio de clientes',
        list: [
            'TPA (Televisão Pública de Angola)',
            'ADMC (Administração Municipal de Cabinda)',
            'Grupo APN',
            'Cabestiva',
            'Grupo Apolónia',
            'Clínica CDAAC',
            'Faculdade de Medicina',
            'Condomínio da Sonangol',
            'Condomínio da AGT',
            'Ministério do Interior',
            'Grupo Emcica',
            'Hospital do Chinga',
            'Angomart',
            'Grupo Impex',
            'Toyota',
            'G4S',
        ],
        bandQuote: 'Conectando Cabinda ao mundo.',
    },
    {
        slug: 'atc',
        name: 'ATC',
        fullName: 'Angbu Training Center',
        sector: 'Formação profissional',
        year: 2017,
        media: 'atc',
        hasVideo: true,
        summary:
            'Centro de formação profissional em informática, redes Cisco, inglês, gestão, HST, Primavera ERP e agro-negócio.',
        highlights: ['16 cursos profissionais', 'Cisco Networking Academy', 'Inglês para adultos e crianças'],
        tagline: 'Formação profissional que transforma carreiras.',
        statement: 'Competências técnicas e práticas, ensinadas por formadores experientes em instalações modernas.',
        paragraphs: [
            'O ATC (Angbu Training Center), fundado em 2017, oferece uma ampla gama de cursos profissionais que visam desenvolver competências técnicas e práticas essenciais para o mercado de trabalho.',
            'Com uma equipa de formadores experientes e instalações modernas, o ATC é o centro de formação ideal para quem procura expandir os seus conhecimentos e melhorar as suas perspectivas de carreira.',
        ],
        stats: [
            { value: '1000+', label: 'Alunos formados' },
            { value: 'Cisco', label: 'Certificação internacional' },
        ],
        servicesTitle: 'Áreas de formação',
        services: [
            { title: 'Cisco Networking Academy', desc: 'Certificação internacional.' },
            { title: 'Primavera ERP', desc: 'Tesouraria, logística, contabilidade e recursos humanos.' },
            { title: 'Redes e manutenção', desc: 'Redes de computadores e reparação de impressoras.' },
            { title: 'Inglês', desc: 'Para adultos e crianças.' },
            { title: 'Agro-negócio', desc: 'Avicultura, suinicultura e piscicultura.' },
        ],
        listTitle: 'Catálogo de cursos',
        list: [
            'Electrónica e Telecomunicações',
            'Microsoft Word Avançado',
            'Microsoft Excel Avançado',
            'Gestão de Stocks e Facturação',
            'Higiene e Segurança no Trabalho (HST)',
            'Informática (Óptica do Utilizador)',
            'Inglês',
            'Inglês Infantil',
            'Manutenção e Reparação de Impressoras',
            'Redes de Computadores',
            'Logística',
            'Primavera ERP',
            'Cisco Networking Academy',
            'Avicultura',
            'Suinicultura',
            'Piscicultura',
        ],
        bandQuote: 'Formação que transforma carreiras.',
    },
    {
        slug: 'angbu-empreitada',
        name: 'Angbu Empreitada',
        fullName: 'Angbu Empreitada',
        sector: 'Construção civil',
        year: 2019,
        media: 'construction',
        hasVideo: true,
        summary:
            'Obras de construção civil de pequena a grande envergadura, com rigor no cumprimento de prazos e padrões de qualidade.',
        highlights: ['Obras públicas e infraestruturas', 'Projectos chave-na-mão', 'Fiscalização de obras'],
        tagline: 'Engenharia e construção de confiança.',
        statement: 'Projectos chave-na-mão que aliam segurança, inovação arquitectónica e rigor nos prazos.',
        paragraphs: [
            'Fundada em 2019, a Angbu Empreitada é dedicada à concepção de obras de construção civil, desde pequenas a grandes envergaduras. É a força construtiva do Grupo ANGBU.',
            'Com vasta experiência no sector da construção civil e obras públicas, entregamos projectos que aliam segurança, inovação arquitectónica e rigoroso cumprimento de prazos.',
        ],
        stats: [
            { value: '50+', label: 'Obras concluídas' },
            { value: '2019', label: 'Fundação' },
        ],
        servicesTitle: 'Especialidades',
        services: [
            { title: 'Construção civil residencial e comercial' },
            { title: 'Obras públicas e infraestruturas' },
            { title: 'Remodelações e restauros' },
            { title: 'Fiscalização de obras' },
            { title: 'Projectos de arquitectura e engenharia' },
        ],
        bandQuote: 'Construindo sonhos.',
    },
    {
        slug: 'angbu-telecom',
        name: 'Angbu Telecom',
        fullName: 'Angbu Telecomunicação e Electrónica',
        sector: 'Tecnologia e electrónica',
        year: 2017,
        media: 'telecom',
        hasVideo: true,
        summary:
            'O braço técnico do grupo: reparação de impressoras, fotocopiadoras, computadores, UPS e placas electrónicas.',
        highlights: ['Diagnóstico de placas electrónicas', 'Computadores e servidores', 'Sistemas de segurança CCTV'],
        tagline: 'O braço técnico do grupo desde 2017.',
        statement: 'Diagnósticos precisos e reparações eficientes para manter os seus equipamentos em pleno funcionamento.',
        paragraphs: [
            'Fundada em 2017, a Angbu Telecomunicação e Electrónica é a parte técnica do grupo, dedicada à reparação de equipamentos electrónicos para clientes corporativos e particulares.',
            'A nossa equipa técnica altamente qualificada garante diagnósticos precisos e reparações eficientes, com rapidez e garantia.',
        ],
        stats: [
            { value: 'Rápido', label: 'Tempo de resposta' },
            { value: 'Garantia', label: 'Serviços certificados' },
        ],
        servicesTitle: 'Serviços',
        services: [
            { title: 'Reparação de impressoras e fotocopiadoras' },
            { title: 'Manutenção de computadores e servidores' },
            { title: 'Reparação de UPS e fontes de energia' },
            { title: 'Diagnóstico e reparação de placas electrónicas' },
            { title: 'Instalação de sistemas de segurança (CCTV)' },
        ],
        bandQuote: 'Precisão técnica, resposta rápida.',
    },
    {
        slug: 'angbu-comercio',
        name: 'Angbu Comércio',
        fullName: 'Angbu Comércio',
        sector: 'Comércio',
        year: 2018,
        media: 'comercio',
        hasVideo: true,
        summary: 'Venda de material informático e de telecomunicações para empresas e particulares.',
        highlights: ['Computadores, portáteis e servidores', 'Equipamento de rede', 'Soluções empresariais à medida'],
        tagline: 'Material informático e de telecomunicações desde 2018.',
        statement: 'Uma rede de fornecedores de prestígio para garantir disponibilidade constante e preços competitivos.',
        paragraphs: [
            'Fundada em 2018, a Angbu Comércio é vocacionada para a venda de material informático e de telecomunicações, com uma rede de fornecedores de alto prestígio.',
            'De computadores e impressoras a equipamentos de rede e telecomunicações, oferecemos soluções completas para empresas e particulares que procuram tecnologia de qualidade.',
        ],
        stats: [
            { value: 'Nacional', label: 'Alcance de distribuição' },
            { value: 'Global', label: 'Rede de fornecedores' },
        ],
        servicesTitle: 'Produtos e serviços',
        services: [
            { title: 'Computadores, portáteis e servidores' },
            { title: 'Impressoras, scanners e fotocopiadoras' },
            { title: 'Equipamentos de rede e telecomunicações' },
            { title: 'Acessórios e periféricos informáticos' },
            { title: 'Soluções empresariais personalizadas' },
        ],
        bandQuote: 'Tecnologia de qualidade, sempre disponível.',
    },
]

/** Phones get the 720p encode; larger screens the 1080p one. */
const small = () => typeof window !== 'undefined' && window.innerWidth < 760

export const media = (key: string) => ({
    video: small() ? `/media/${key}-720.mp4` : `/media/${key}.mp4`,
    poster: `/media/${key}.webp`,
    still: `/media/${key}-still.webp`,
})

export const milestones = [
    { year: '2017', title: 'Fundação do Grupo', text: 'A 18 de Abril nasce o Grupo ANGBU, com a Angbu Telecomunicação e Electrónica e o Angbu Training Center.', tag: 'Angbu Telecom · ATC' },
    { year: '2018', title: 'Primeira expansão', text: 'O grupo cresce com a fundação da Angbu Comércio, dedicada a material informático e de telecomunicações.', tag: 'Angbu Comércio' },
    { year: '2019', title: 'Construção civil', text: 'Lançamento da Angbu Empreitada, alargando a actuação ao sector da construção civil e obras públicas.', tag: 'Angbu Empreitada' },
    { year: '2020', title: 'Telecomunicações', text: 'Nasce a Tchiowa Net, marcando a entrada do grupo no fornecimento de internet em Cabinda.', tag: 'Tchiowa Net' },
    { year: '2021', title: 'Indústria', text: 'Inauguração da Cab-Ração, reforçando o compromisso com a produção de rações animais de alta qualidade.', tag: 'Cab-Ração' },
    { year: '2025', title: 'Chegada ao Soyo', text: 'A 27 de Outubro, a Tchiowa Net chega ao Soyo, na província do Zaire, com internet de alta velocidade para empresas e residências.', tag: 'Tchiowa Net' },
]

export const clients = [
    'TPA', 'ADMC', 'Grupo APN', 'Cabestiva', 'Grupo Apolónia', 'Clínica CDAAC', 'Faculdade de Medicina',
    'Ministério do Interior', 'Grupo Emcica', 'Hospital do Chinga', 'Angomart', 'Grupo Impex',
    'Toyota', 'G4S', 'Sonangol', 'AGT', 'CIMAC', 'AGN',
]

export const leaders = [
    { name: 'Ângelo Gabriel Buanga', role: 'Fundador e Director Geral', text: 'Principal estratega e visionário do grupo, com uma liderança orientada para resultados e inovação desde a fundação.' },
    { name: 'Albertina Buanga', role: 'Directora de Capital Humano', text: 'Responsável pela gestão de talentos e pelo desenvolvimento do capital humano, cultivando uma cultura organizacional positiva.' },
    { name: 'Nataniel Massiala', role: 'Director Administrativo', text: 'Assegura a eficiência dos processos operacionais e administrativos e o cumprimento dos objectivos internos.' },
]
