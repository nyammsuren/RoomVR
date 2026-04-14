import * as THREE from "three";

export function createRoom6(scene) {
    const room = new THREE.Group();
    scene.add(room);

    const RW = 12, RH = 6, RD = 12;

    function mat(color, rough = 0.8, metal = 0) {
        return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
    }

    // === ГЭРЭЛТҮҮЛЭГ — futuristic cyan/blue ===
    room.add(new THREE.AmbientLight(0x0a1a2e, 0.8));
    const dir = new THREE.DirectionalLight(0x4488ff, 0.4);
    dir.position.set(2, 8, 3);
    dir.castShadow = true;
    room.add(dir);

    // Таазны неон гэрлийн хавтас — cyan
    [[-3,-3],[3,-3],[-3,3],[3,3]].forEach(([x,z]) => {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 0.04, 0.12),
            new THREE.MeshStandardMaterial({ color: 0x00eeff, emissive: 0x00eeff, emissiveIntensity: 3.0 })
        );
        panel.position.set(x, RH - 0.02, z);
        room.add(panel);
        const l = new THREE.PointLight(0x00ccff, 2.5, 8);
        l.position.set(x, RH - 0.15, z);
        room.add(l);
    });

    // Хана дагасан неон тууз — доод хэсэг
    [
        [0, 0, -RD/2 + 0.02, 0],
        [0, 0,  RD/2 - 0.02, Math.PI],
        [-RW/2 + 0.02, 0, 0, Math.PI/2],
        [ RW/2 - 0.02, 0, 0, -Math.PI/2],
    ].forEach(([x, _y, z, ry]) => {
        const w = (ry === 0 || ry === Math.PI) ? RW : RD;
        const strip = new THREE.Mesh(
            new THREE.BoxGeometry(w, 0.04, 0.04),
            new THREE.MeshStandardMaterial({ color: 0x0044ff, emissive: 0x0044ff, emissiveIntensity: 2.5 })
        );
        strip.position.set(x, 0.08, z);
        strip.rotation.y = ry;
        room.add(strip);
        const sl = new THREE.PointLight(0x0033cc, 0.8, 3);
        sl.position.set(x, 0.2, z);
        room.add(sl);
    });

    // === ШАЛ, ТААЗ, ХАНУУД — futuristic ===
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0x050a14, 0.3, 0.6));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    floor.userData = { teleport: true };
    room.add(floor);

    // Шалны cyan торон сүлжээ
    for (let i = -5; i <= 5; i++) {
        const hLine = new THREE.Mesh(new THREE.PlaneGeometry(RW, 0.025),
            new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x00aaff, emissiveIntensity: 1.0, transparent: true, opacity: 0.6 }));
        hLine.rotation.x = -Math.PI / 2;
        hLine.position.set(0, 0.001, i);
        room.add(hLine);
        const vLine = new THREE.Mesh(new THREE.PlaneGeometry(0.025, RD),
            new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x00aaff, emissiveIntensity: 1.0, transparent: true, opacity: 0.6 }));
        vLine.rotation.x = -Math.PI / 2;
        vLine.position.set(i, 0.001, 0);
        room.add(vLine);
    }

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), mat(0x060a16, 0.9));
    ceil.rotation.x = Math.PI / 2;
    ceil.position.set(0, RH, 0);
    room.add(ceil);

    [
        [RW, RH, [0, RH/2, -RD/2], 0],
        [RW, RH, [0, RH/2,  RD/2], Math.PI],
        [RD, RH, [-RW/2, RH/2, 0],  Math.PI/2],
        [RD, RH, [ RW/2, RH/2, 0], -Math.PI/2],
    ].forEach(([w, h, pos, ry]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat(0x080d1a, 0.9));
        m.position.set(...pos);
        m.rotation.y = ry;
        room.add(m);
    });

    // === ГАРЧИГ (арын хана дээр) ===
    const titleCvs = document.createElement("canvas");
    titleCvs.width = 1024; titleCvs.height = 140;
    const tc = titleCvs.getContext("2d");
    tc.fillStyle = "#00eeff";
    tc.shadowColor = "#00aaff";
    tc.shadowBlur = 18;
    tc.font = "bold 80px Arial";
    tc.textAlign = "center";
    tc.textBaseline = "middle";
    tc.fillText("НОМЫН САН", 512, 70);
    const titleMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(4.5, 0.63),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(titleCvs), transparent: true })
    );
    titleMesh.position.set(0, RH - 0.55, -RD/2 + 0.05);
    room.add(titleMesh);

    // === НОМ МЭДЭЭЛЛИЙН САМБАР (арын хана) ===
    const infoCvs = document.createElement("canvas");
    infoCvs.width = 2048; infoCvs.height = 1024;
    const ic = infoCvs.getContext("2d");
    ic.clearRect(0, 0, 2048, 1024);
    const infoTex = new THREE.CanvasTexture(infoCvs);

    const infoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(9.0, 4.5),
        new THREE.MeshBasicMaterial({ map: infoTex, transparent: true })
    );
    infoMesh.position.set(0, 2.8, -RD/2 + 0.06);
    room.add(infoMesh);

    // === НОМЫН МЭДЭЭЛЭЛ ===
    const bookData = [
        { title: "Свич", color: 0x1a5fa6, hex: "#1a5fa6",
          info: ["Тодорхойлолт:",
            "Свич нь дотоод сүлжээнд төхөөрөмжүүдийг хооронд нь холбож,",
            "өгөгдлийг MAC хаяг дээр үндэслэн дамжуулдаг төхөөрөмж юм.", 
            "Энэ нь өгөгдлийг бүх сүлжээнд түгээх бус, зөвхөн зорилтот төхөөрөмж рүү",
            "чиглүүлэн дамжуулснаар сүлжээний гүйцэтгэл, үр ашгийг сайжруулдаг."] },
        { title: "Рутер", color: 0xcc4400, hex: "#cc4400",
          info: ["Тодорхойлолт:","Рутер нь сүлжээнүүдийн хооронд өгөгдөл дамжуулж,",
            "интернетийн холболтыг олон төхөөрөмжид хуваарилдаг төхөөрөмж юм.",
            "Энэ нь мэдээллийг зөв чиглэлд илгээж, сүлжээний аюулгүй байдлыг",
            " хангахад чухал үүрэгтэй."] },
             { title: "Firewall", color: 0x228866, hex: "#228866",
          info: ["Тодорхойлолт:","Firewall нь сүлжээний аюулгүй байдлыг хангах зорилготой",
            "хамгаалалтын систем юм. Энэ нь орж ирэх болон гарч буй өгөгдлийг",
            "шалгаж, зөвшөөрөгдөөгүй хандалтыг блоклон, зөвшөөрөгдсөн урсгалыг",
            "нэвтрүүлдэг. Ингэснээр компьютер болон сүлжээг халдлага, вирус,",
            "зөвшөөрөлгүй нэвтрэлтээс хамгаалдаг хэрэгсэл юм."] },
         { title: "WiFi router", color: 0x7b2fbe, hex: "#7b2fbe",
          info: ["Утасгүй сүлжээний рутер",
                 "Утасгүй сүлжээний рутер нь интернет холболтыг олон төхөөрөмжид",
                 "утасгүй хэлбэрээр түгээдэг төхөөрөмж юм. Энэ нь интернетээс ирсэн",
                 "өгөгдлийг хүлээн авч, утас, компьютер, таблет зэрэг төхөөрөмжүүдэд",
                 "дамжуулдаг. Мөн IP хаяг олгох, өгөгдлийг зөв чиглэлд илгээх,",
                 "сүлжээний аюулгүй байдлыг хамгаалах үүрэгтэй"] },
  { title: "DHCP сервер", color: 0x2a8a3e, hex: "#2a8a3e",
          info: ["Тодорхойлолт:","DHCP сервер нь сүлжээнд холбогдсон төхөөрөмжүүдэд",
            "IP хаяг болон бусад тохиргоог автоматаар олгодог систем юм. ",
            "Энэ нь сүлжээний удирдлагыг хялбарчилж, төхөөрөмжүүдийг хурдан холбох",
            "боломжийг бүрдүүлдэг чухал үйлчилгээ юм.. "] },
       
       
        { title: "Вэб сервер", color: 0x0077aa, hex: "#0077aa",
          info: ["Тодорхойлолт:","Вэб сервер нь хэрэглэгчийн хүсэлтийг хүлээн авч,",
            "вэб хуудсууд болон файлуудыг интернэтээр дамжуулан илгээдэг",
            "программ эсвэл төхөөрөмж юм. Энэ нь сайт ажиллуулах үндсэн үүрэгтэй."] },
        { title: "FTP сервер", color: 0xaa1111, hex: "#aa1111",
          info: ["Тодорхойлолт",
                 "FTP сервер нь файл дамжуулах зориулалттай сервер юм.",
                 "Энэ нь хэрэглэгчид интернэтээр дамжуулан файлыг upload",
                 "болон download хийх боломж олгодог. FTP (File Transfer Protocol) ашиглан",
                 "сервер болон хэрэглэгчийн хооронд өгөгдөл солилцох үйл ажиллагааг",
                 "зохион байгуулдаг систем юм."] },
        { title: "DNS сервер", color: 0xff8800, hex: "#ff8800",
          info: ["Тодорхойлолт:","DNS сервер нь домэйн нэрийг IP хаяг руу хөрвүүлдэг систем юм.",
            "Хэрэглэгч вэб хаяг бичихэд DNS сервер тухайн сайтын жинхэнэ серверийн",
            "хаягийг олж өгч, холболтыг боломжтой болгодог чухал"," сүлжээний үйлчилгээ юм."] },
        // === Сүлжээний тохиргооны номнууд (индекс 8–12) ===
        { title: "VLAN", color: 0x1a6b8a, hex: "#1a6b8a",
          info: ["Нэг физик сүлжээг логик хэсгүүдэд хуваах технологи",
                   "vlan 10",
    "name MBUS",
    "interface fastEthernet 0/1",
    "switchport access vlan 10"] },
        { title: "RIPv1", color: 0x7a3a9a, hex: "#7a3a9a",
          info: ["RIPv1 (Routing Information Protocol v1) нь distance-vector",
            "алгоритм ашигладаг замчлалын протокол. Hop count-ыг метрик болгон",
            "ашиглах бөгөөд хамгийн ихдээ 15 hop-ийг дэмждэг. Бичигдэх хэлбэр:",
            "router rip",
    "network 192.168.1.0",
        ] },
        { title: "RIPv2", color: 0x2a7a3a, hex: "#2a7a3a",
          info: ["RIPv2 нь RIPv1-ийн сайжруулсан хувилбар.",
            "Subnetmask дамжуулдаг тул илүү нарийвчлалтай. Бичигдэх хэлбэр:",
    "router rip",
    "version 2",
    "network 192.168.1.0"] },
        { title: "Static Route", color: 0xaa5500, hex: "#aa5500",
          info: ["Static route нь сүлжээрүү гарах замыг гараар тохируулдаг.",
            "Бичигдэх хэлбэр нь: ip route 192.168.2.0 255.255.255.0 192.168.1.1",
            "192.168.2.0 → Зорих сүлжээний хаяг, 255.255.255.0 → Subnet mask",
            "192.168.1.1 → next hop хаяг."] },
        { title: "Default Route", color: 0x8a1a1a, hex: "#8a1a1a",
          info: ["Default route нь замчлалын хүснэгтэд тохирох зам олдоогүй үед",
            "пакетийг дамжуулах замыг заадаг. Бичигдэх хэлбэр: ",
            "ip route 0.0.0.0 0.0.0.0 192.168.1.1",
            "ip route → Статик маршрут тохируулах команд, 0.0.0.0 0.0.0.0 → Бүх сүлжээг",
            "илэрхийлэх бол  192.168.1.1 → next hop хаяг юм"] },
        // === DHCP — индекс 13 ===
        { title: "DHCP", color: 0x1a7a5a, hex: "#1a7a5a",
          info: ["DHCP нь сүлжээнд IP хаягийг автоматаар олгодог протокол",
              "ip dhcp pool LAN",
    "network 192.168.1.0 255.255.255.0",
    "default-router 192.168.1.1",
    "dns-server 8.8.8.8"] },
        // === IP хаяглалын номнууд — индекс 14–19 ===
        { title: "IPv4", color: 0x1155aa, hex: "#1155aa",
          info: ["IPv4 нь 32 битийн хаяглалын систем бөгөөд 4 октетоос бүрддэг.",
            "Жишээ: 192.168.1.1 — дотоод сүлжээний хаяг.",
            "Нийт ~4.3 тэрбум хаяг байх боловч NAT ашиглан хомсдлыг шийддэг.",
            "Классууд: A (1-126), B (128-191), C (192-223)"] },
        { title: "IPv6", color: 0x0088cc, hex: "#0088cc",
          info: ["IPv6 нь 128 битийн хаяглалын систем. 340 их наяд хаяг.",
            "Жишээ: 2001:0db8:85a3::8a2e:0370:7334",
            "Давуу тал: хаягийн хомсдол байхгүй, IPSec суурилуулсан,",
            "автоматаар тохируулагддаг (SLAAC)"] },
        { title: "Subnet", color: 0x226688, hex: "#226688",
          info: ["Subnetting нь сүлжээг жижиг хэсгүүдэд хуваах арга.",
            "255.255.255.0 (/24) → 254 хост, 255.255.255.128 (/25) → 126 хост",
            "CIDR тэмдэглэгээ: 192.168.1.0/24",
            "Host тоо = 2^(32-prefix) - 2"] },
        { title: "NAT", color: 0x448822, hex: "#448822",
          info: ["NAT (Network Address Translation) нь дотоод хувийн IP хаягийг",
            "гадаад нийтийн IP хаяг руу хөрвүүлдэг. Гурван төрөл:",
            "Static NAT: нэг-нэгтэй харгалзаа",
            "Dynamic NAT: хэд хэдэн нийтийн IP-тэй   PAT/Overload: нэг IP, олон порт"] },
        { title: "CIDR", color: 0x885522, hex: "#885522",
          info: ["CIDR (Classless Inter-Domain Routing) нь уян хатан хаяглалын арга.",
            "Prefix урт нь /8-аас /30 хүртэл байж болно.",
            "192.168.0.0/22 → 192.168.0.0-192.168.3.255 (1022 хост)",
            "Замчлалын хүснэгтийг нэгтгэхэд (supernetting) ашиглагддаг."] },
        { title: "ARP", color: 0x664488, hex: "#664488",
          info: ["ARP (Address Resolution Protocol) нь IP хаягаас MAC хаяг олдог.",
            "Процесс: broadcast асуулт → зорилтот хост хариулна → кэшэд хадгална.",
            "arp -a командаар ARP хүснэгтийг харна.",
            "Gratuitous ARP, ARP spoofing халдлагад анхаарах хэрэгтэй."] },
        // === Сүлжээний серверүүд нэмэлт — индекс 20–21 ===
        { title: "Mail сервер", color: 0xcc3366, hex: "#cc3366",
          info: ["Mail сервер нь мэйл хүлээн авч, хадгалж, дамжуулдаг систем.",
            "Протоколууд: SMTP (илгээх, 25-р порт), POP3 (татах, 110),",
            "IMAP (синхрончлох, 143). Жишээ серверүүд: Postfix, Sendmail,",
            "Microsoft Exchange. SPF, DKIM, DMARC спам хамгаалалтад ашиглагддаг."] },
        { title: "Database сервер", color: 0x336699, hex: "#336699",
          info: ["Database сервер нь өгөгдөл хадгалах, удирдах төвлөрсөн систем.",
            "Хэрэглэгчдийн мэдээлэл, системийн өгөгдлийг найдвартай хадгалж,",
            "хурдан хайлт, боловсруулалт хийх боломжийг бүрдүүлдэг технологи",
            "SQL асуулга: SELECT, INSERT, UPDATE, DELETE, JOIN үйлдлүүд."] },
    ];

    let activeBookIdx = -1;
    function drawInfoPanel(idx) {
        ic.clearRect(0, 0, 2048, 1024);
        if (idx < 0) { infoTex.needsUpdate = true; return; }
        const b = bookData[idx];
        // Futuristic holographic панел
        ic.fillStyle = "rgba(0, 8, 24, 0.96)";
        ic.beginPath();
        if (ic.roundRect) ic.roundRect(16, 16, 2016, 992, 24);
        else ic.rect(16, 16, 2016, 992);
        ic.fill();
        // Гадна гэрэлт хүрээ
        ic.strokeStyle = "#00eeff";
        ic.lineWidth = 6;
        ic.shadowColor = "#00ccff";
        ic.shadowBlur = 20;
        ic.stroke();
        ic.shadowBlur = 0;
        // Дотор нарийн хүрээ
        ic.strokeStyle = b.hex;
        ic.lineWidth = 3;
        ic.beginPath();
        if (ic.roundRect) ic.roundRect(28, 28, 1992, 968, 18);
        else ic.rect(28, 28, 1992, 968);
        ic.stroke();
        // Гарчиг
        ic.shadowColor = b.hex;
        ic.shadowBlur = 16;
        ic.fillStyle = "#ffffff";
        ic.font = "bold 100px Arial";
        ic.textAlign = "center";
        ic.textBaseline = "top";
        ic.fillText(b.title, 1024, 44);
        ic.shadowBlur = 0;
        // Хуваах шугам
        ic.strokeStyle = "#00eeff44";
        ic.lineWidth = 2;
        ic.beginPath(); ic.moveTo(80, 188); ic.lineTo(1968, 188); ic.stroke();
        b.info.forEach((line, i) => {
            ic.fillStyle = i === 0 ? "#00eeff" : "#aaddff";
            ic.font = i === 0 ? "bold 58px Arial" : "52px Arial";
            ic.textAlign = "left";
            ic.textBaseline = "top";
            ic.fillText(line, 100, 216 + i * 160);
        });
        infoTex.needsUpdate = true;
    }

    // === НОМЫН ТАВИУР ===
    function addBookshelf(wallX, wallZ, faceDir, bookIndices) {
        // faceDir: 1 = зүүн хана (+x рүү харна), -1 = баруун хана (-x рүү харна)
        const shM = mat(0x6b3a1f, 0.7);
        const bdM = mat(0x8b5a2b, 0.6);
        const D = 0.26; // тавцангийн гүн

        // Арын самбар
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.09, 3.2, 2.2), shM);
        back.position.set(wallX + faceDir * 0.05, 1.6, wallZ);
        room.add(back);

        // Хажуугийн хавтан
        [-1.1, 1.1].forEach(dz => {
            const s = new THREE.Mesh(new THREE.BoxGeometry(D + 0.05, 3.2, 0.06), shM);
            s.position.set(wallX + faceDir * (D/2 + 0.07), 1.6, wallZ + dz);
            room.add(s);
        });

        // Тавцангууд (4 давхар) — номын өндөрт тохируулан зайг нэмэв
        const SY = [0.45, 1.32, 2.19, 3.06];
        SY.forEach(sy => {
            const sh = new THREE.Mesh(new THREE.BoxGeometry(D + 0.05, 0.05, 2.2), bdM);
            sh.position.set(wallX + faceDir * (D/2 + 0.07), sy, wallZ);
            room.add(sh);
        });

        // Номнууд — ижил хэмжээ, 3D ном хэлбэртэй
        const BH = 0.56, BT = 0.13, BW = D - 0.02;

        bookIndices.forEach((bi, slot) => {
            const b = bookData[bi];
            const shelfIdx = Math.floor(slot / 2);
            const zOff = slot % 2 === 0 ? -0.52 : 0.52;
            const sy = SY[shelfIdx];
            const bx = wallX + faceDir * (D/2 + 0.08);
            const by = sy + BH/2 + 0.04;

            const bookG = new THREE.Group();
            bookG.position.set(bx, by, wallZ + zOff);

            // Нурууны canvas (босоо текст)
            const spineCvs = document.createElement('canvas');
            spineCvs.width = 128; spineCvs.height = 512;
            const sc = spineCvs.getContext('2d');
            sc.fillStyle = b.hex;
            sc.fillRect(0, 0, 128, 512);
            sc.fillStyle = 'rgba(0,0,0,0.22)';
            sc.fillRect(0, 0, 128, 36);
            sc.fillRect(0, 476, 128, 36);
            sc.fillStyle = '#ffffff';
            sc.font = 'bold 34px Arial';
            sc.textAlign = 'center'; sc.textBaseline = 'middle';
            sc.save(); sc.translate(64, 256); sc.rotate(-Math.PI / 2);
            sc.fillText(b.title, 0, 0); sc.restore();

            // Хавтасны canvas
            const coverCvs = document.createElement('canvas');
            coverCvs.width = 256; coverCvs.height = 512;
            const cc = coverCvs.getContext('2d');
            cc.fillStyle = b.hex;
            cc.fillRect(0, 0, 256, 512);
            cc.fillStyle = 'rgba(255,255,255,0.10)';
            cc.fillRect(14, 14, 228, 484);
            cc.strokeStyle = 'rgba(255,255,255,0.30)';
            cc.lineWidth = 3; cc.strokeRect(14, 14, 228, 484);
            cc.fillStyle = '#ffffff'; cc.font = 'bold 30px Arial';
            cc.textAlign = 'center'; cc.textBaseline = 'middle';
            cc.fillText(b.title, 128, 256);

            // 6 нүүрний материал: +x, -x, +y, -y, +z, -z
            const pageMat  = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.95 });
            const spineMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(spineCvs), roughness: 0.6 });
            const coverMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(coverCvs), roughness: 0.6 });
            const backMat  = new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.7 });

            // faceDir=1: нуруу +x рүү (өрөөний дотор) харна
            const mats = faceDir > 0
                ? [spineMat, backMat, pageMat, pageMat, coverMat, coverMat]
                : [backMat, spineMat, pageMat, pageMat, coverMat, coverMat];

            const body = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, BT), mats);
            body.userData = { kind: 'book', bookIdx: bi };
            bookG.add(body);

            // Хуудасны дээд ирмэг (цагаан)
            const pageTop = new THREE.Mesh(
                new THREE.BoxGeometry(BW * 0.90, 0.007, BT * 0.86),
                new THREE.MeshStandardMaterial({ color: 0xeee8dc, roughness: 1.0 })
            );
            pageTop.position.y = BH / 2 - 0.004;
            bookG.add(pageTop);

            bookG.userData = { kind: 'book', bookIdx: bi };
            room.add(bookG);
        });
    }

    // Зүүн хана — ном 0–3
    addBookshelf(-RW/2 + 0.14, -2.8, 1, [0, 1, 2, 3]);
    // Зүүн хана — ном 4–7
    addBookshelf(-RW/2 + 0.14,  2.5, 1, [4, 5, 6, 7, 20, 21]);

    // Тавиурын гарчиг шошгууд
    [
        { z: -2.8, text: "Сүлжээний төхөөрөмжүүд" },
        { z:  2.5, text: "Сүлжээний серверүүд"    },
    ].forEach(({ z, text }) => {
        const lc = document.createElement("canvas");
        lc.width = 1024; lc.height = 128;
        const lctx = lc.getContext("2d");
        lctx.fillStyle = "rgba(60, 30, 5, 0.88)";
        lctx.fillRect(0, 0, 1024, 128);
        lctx.strokeStyle = "#c8841a";
        lctx.lineWidth = 5;
        lctx.strokeRect(4, 4, 1016, 120);
        lctx.fillStyle = "#ffe0a0";
        lctx.font = "bold 68px Arial";
        lctx.textAlign = "center";
        lctx.textBaseline = "middle";
        lctx.fillText(text, 512, 64);
        const lbl = new THREE.Mesh(
            new THREE.PlaneGeometry(2.4, 0.30),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc), transparent: true, depthTest: false })
        );
        lbl.position.set(-RW/2 + 0.42, 3.45, z);
        lbl.rotation.y = Math.PI / 2;
        room.add(lbl);
    });

    // Баруун хана — Сүлжээний тохиргоо тавиур (интерактив)
    addBookshelf(RW/2 - 0.14, -2.5, -1, [8, 9, 10, 11, 12, 13]);

    // Тавиурын гарчиг — баруун хана
    (() => {
        const lc = document.createElement("canvas");
        lc.width = 1024; lc.height = 128;
        const lctx = lc.getContext("2d");
        lctx.fillStyle = "rgba(60, 30, 5, 0.88)";
        lctx.fillRect(0, 0, 1024, 128);
        lctx.strokeStyle = "#c8841a";
        lctx.lineWidth = 5;
        lctx.strokeRect(4, 4, 1016, 120);
        lctx.fillStyle = "#ffe0a0";
        lctx.font = "bold 68px Arial";
        lctx.textAlign = "center";
        lctx.textBaseline = "middle";
        lctx.fillText("Сүлжээний тохиргоо", 512, 64);
        const lbl = new THREE.Mesh(
            new THREE.PlaneGeometry(2.4, 0.30),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc), transparent: true, depthTest: false })
        );
        lbl.position.set(RW/2 - 0.42, 3.45, -2.5);
        lbl.rotation.y = -Math.PI / 2;
        room.add(lbl);
    })();

    // Баруун хана — IP хаяглал тавиур (интерактив)
    addBookshelf(RW/2 - 0.14, 2.5, -1, [14, 15, 16, 17, 18, 19]);

    (() => {
        const lc = document.createElement('canvas');
        lc.width = 1024; lc.height = 128;
        const lctx = lc.getContext('2d');
        lctx.fillStyle = 'rgba(60, 30, 5, 0.88)';
        lctx.fillRect(0, 0, 1024, 128);
        lctx.strokeStyle = '#c8841a';
        lctx.lineWidth = 5;
        lctx.strokeRect(4, 4, 1016, 120);
        lctx.fillStyle = '#ffe0a0';
        lctx.font = 'bold 68px Arial';
        lctx.textAlign = 'center';
        lctx.textBaseline = 'middle';
        lctx.fillText('IP хаяглал', 512, 64);
        const lbl = new THREE.Mesh(
            new THREE.PlaneGeometry(2.4, 0.30),
            new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc), transparent: true, depthTest: false })
        );
        lbl.position.set(RW/2 - 0.42, 3.45, 2.5);
        lbl.rotation.y = -Math.PI / 2;
        room.add(lbl);
    })();

    // === УНШЛАГЫН ШИРЭЭ ===
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.0), mat(0x8b5a2b, 0.6));
    tableTop.position.set(2.5, 0.78, 0);
    room.add(tableTop);
    [[1.0,0.45],[1.0,-0.45],[-1.0,0.45],[-1.0,-0.45]].forEach(([dx,dz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.78, 0.06), mat(0x5a3010, 0.7));
        leg.position.set(2.5 + dx, 0.39, dz);
        room.add(leg);
    });

    // Уншлагын сандлууд (4 ширхэг)
    [
        { cx: 1.05, cz:  0.55, lx: 2.5, lz:  0, ry: 0          },
        { cx: 1.05, cz: -0.55, lx: 2.5, lz:  0, ry: 0          },
        { cx: 3.95, cz:  0.55, lx: 2.5, lz:  0, ry: Math.PI    },
        { cx: 3.95, cz: -0.55, lx: 2.5, lz:  0, ry: Math.PI    },
    ].forEach(({ cx, cz, lx, lz, ry }) => {
        const cg = new THREE.Group();
        const cM = mat(0x7a4a20, 0.65);

        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.04, 0.36), cM);
        seat.position.set(0, 0.44, 0);
        seat.userData = { kind: "studentChair",
            sitX: cx, sitY: 1.1, sitZ: cz,
            lookX: lx, lookY: 0.9, lookZ: lz };
        cg.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.36, 0.04), cM);
        back.position.set(0, 0.65, ry === 0 ? 0.16 : -0.16);
        cg.add(back);

        [[0.15,0.13],[-0.15,0.13],[0.15,-0.13],[-0.15,-0.13]].forEach(([dx,dz]) => {
            const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.44, 0.04), mat(0x3a1a08, 0.5));
            l.position.set(dx, 0.22, dz);
            cg.add(l);
        });

        cg.position.set(cx, 0, cz);
        cg.rotation.y = ry;
        room.add(cg);
    });

    // === НОМЫН САНЧ — мубси баавгай ===
    let libraryBear = null;
    new THREE.TextureLoader().load("./assets/nom.png", (tex) => {
        const aspect = tex.image.width / tex.image.height;
        const h = 1.9, w = h * aspect;
        libraryBear = new THREE.Group();
        libraryBear.position.set(4.5, h/2, -2.5);
        room.add(libraryBear);
        const bm = new THREE.Mesh(
            new THREE.PlaneGeometry(w, h),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.1 })
        );
        bm.userData = { kind: "roomAudio" };
        libraryBear.add(bm);
        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(w * 0.3, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.set(4.5, 0.01, -2.5);
        room.add(shadow);
    });

    // === ХААЛГА — угтах танхим руу ===
    const doorColor = 0xddaa00;
    const bFrame = new THREE.Mesh(new THREE.BoxGeometry(1.12, 2.12, 0.06), mat(0x888888, 0.3, 0.6));
    bFrame.position.set(0, 1.06, RD/2 - 0.01);
    room.add(bFrame);

    const bDoor = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 0.15),
        new THREE.MeshStandardMaterial({ color: doorColor, transparent: true, opacity: 0.82,
            emissive: doorColor, emissiveIntensity: 0.2 })
    );
    bDoor.position.set(0, 1, RD/2 - 0.12);
    bDoor.userData = { kind: "backDoor" };
    room.add(bDoor);

    const bLight = new THREE.PointLight(doorColor, 2.2, 5);
    bLight.position.set(0, 1.8, RD/2 - 0.7);
    room.add(bLight);

    const dlCvs = document.createElement("canvas");
    dlCvs.width = 1024; dlCvs.height = 128;
    const dlc = dlCvs.getContext("2d");
    dlc.clearRect(0, 0, 1024, 128);
    dlc.fillStyle = "#ddaa00";
    dlc.font = "bold 56px Arial";
    dlc.textAlign = "center"; dlc.textBaseline = "middle";
    dlc.fillText("Угтах танхим руу", 512, 64);
    const doorLbl = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 0.32),
        new THREE.MeshBasicMaterial({
            map: new THREE.CanvasTexture(dlCvs), transparent: true, depthTest: false
        })
    );
    doorLbl.position.set(0, 2.65, RD/2 - 0.1);
    doorLbl.rotation.y = Math.PI;
    room.add(doorLbl);

    // onClick — ном дарах (бүх hits сканнална — тавиурын хавтас дайрагдсан ч алгасна)
    room.userData.onClick = (raycaster) => {
        const hits = raycaster.intersectObjects(room.children, true);
        if (!hits.length) return;
        for (const hit of hits) {
            let obj = hit.object;
            while (obj && !obj.userData?.kind) obj = obj.parent;
            if (obj?.userData?.kind === "book") {
                const idx = obj.userData.bookIdx;
                if (activeBookIdx === idx) { activeBookIdx = -1; drawInfoPanel(-1); }
                else { activeBookIdx = idx; drawInfoPanel(idx); }
                return;
            }
        }
    };

    const nomAudio = new Audio("./assets/nom.mp3");
    nomAudio.loop = false;
    room.userData.toggleAudio = () => {
        if (nomAudio.paused) { nomAudio.currentTime = 0; nomAudio.play(); }
        else { nomAudio.pause(); }
    };

    room.userData.update = (camera) => {
        if (libraryBear && camera) {
            libraryBear.rotation.y = Math.atan2(
                camera.position.x - libraryBear.position.x,
                camera.position.z - libraryBear.position.z
            );
        }
    };

    return room;
}
