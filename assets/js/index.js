let get = document.querySelector.bind(document)
let getAll = document.querySelectorAll.bind(document)

let PLAYER_STORAGE_KEY = 'QV_PLAYER'

let main = get('.main')
let cd = get('.cd')
let cdThumb = get('.cd-thumb')
let songName = get('.desc .name')
let songSinger = get('.desc .singer')
let inputRange = get('.range')
let progress = get('.progress')
let timeCurrent = get('.time-left')
let timeEnd = get('.time-right')
let playBtn = get('.btn.btn-toggle-play')
let nextBtn = get('.btn.btn-next')
let prevBnt = get('.btn.btn-prev')
let randomBtn = get('.btn.btn-random')
let repeatBtn = get('.btn.btn-repeat')
let playlist = get('.main-item.playlist')

let cdThumbAnimate = cdThumb.animate([
    {transform: 'rotate(360deg)'}
], {
    duration: 10000,
    iterations: Infinity
})
cdThumbAnimate.pause()

let app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    randomSongList: [],
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: 'Đoạn Tuyệt Nàng Đi',
            singer: 'Phát Huy',
            path: './assets/music/DoanTuyetNangDi.mp3',
            image: './assets/images/DoanTuyetNangDi.jpg'
        },
        {
            name: 'See Tình',
            singer: 'Vanh',
            path: './assets/music/SeeTinh.mp3',
            image: './assets/images/SeeTinh.jpg'
        },
        {
            name: 'Nhạc Nền Florentino Tú Có NY',
            singer: 'Thầy Giáo X',
            path: './assets/music/NhacNenFlo.mp3',
            image: './assets/images/NhacNenFlo.jpg'
        },
        {
            name: 'Yêu Đừng Sợ Đau',
            singer: 'Ngô Lan Hương',
            path: './assets/music/YeuDungSoDau.mp3',
            image: './assets/images/YeuDungSoDau.jpg'
        },
        {
            name: 'Shape of You',
            singer: 'Ed Sheeran',
            path: './assets/music/ShapeOfYou.mp3',
            image: './assets/images/ShapeOfYou.jpg'
        },
        {
            name: 'We Dont Talk Anymore',
            singer: 'Charlie Puth',
            path: './assets/music/WeDontTalkAnymore.mp3',
            image: './assets/images/WeDontTalkAnymore.jpg'
        },
        {
            name: 'Señorita',
            singer: 'Shawn Mendes',
            path: './assets/music/Señorita.mp3',
            image: './assets/images/Señorita.jpg'
        },
        {
            name: 'Vì Mẹ Anh Bắt Chia Tay',
            singer: 'Miu Lê ft Karik',
            path: './assets/music/ViMeAnhBatChiaTay.mp3',
            image: './assets/images/ViMeAnhBatChiaTay.jpg'
        },
        {
            name: 'Attention',
            singer: 'Charlie Puth',
            path: './assets/music/Attention.mp3',
            image: './assets/images/Attention.jpg'
        },
        {
            name: 'Comethru',
            singer: 'Jeremy Zucker',
            path: './assets/music/Comethru.mp3',
            image: './assets/images/Comethru.jpg'
        },
    ],

    setConfig(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    conditionLoadConfig(key) {
        return Object.keys(this.config).includes(key) ? true : false
    },

    loadConfig() {
        this.conditionLoadConfig('currentIndex') && (
            this.currentIndex = this.config.currentIndex
        )

        this.conditionLoadConfig('audioCurrentTime') && (
            getAll('audio')[this.currentIndex].currentTime = this.config.audioCurrentTime
        )

        this.conditionLoadConfig('isRandom') && (
            this.isRandom = this.config.isRandom,
            randomBtn.classList.toggle('active', this.isRandom)
        )

        this.conditionLoadConfig('isRepeat') && (
            this.isRepeat = this.config.isRepeat,
            repeatBtn.classList.toggle('active', this.isRepeat)
        )
    },

    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex]
            }
        })

        Object.defineProperty(this, 'currentAudio', {
            get() {
                return getAll('audio')[this.currentIndex]
            }
        })

        Object.defineProperty(this, 'currentSongElement', {
            get() {
                return getAll('.song')[this.currentIndex]
            }
        })
    },

    render() {
        let html = this.songs.map((song, index) => {
            return `
                <div class="song">
                    <audio src="${song.path}"></audio>
                    <div class="index">${this.defaultNumber(index + 1)}</div>
                    <img src="${song.image}" class="thumb" alt="">
                    <ion-icon name="caret-forward-outline" class="icon-right"></ion-icon>
                    <div class="music">
                        <div class="name">${song.name}</div>
                        <div class="singer">${song.singer}</div>
                    </div>
                    <div class="time"></div>
                </div>
            `
        })

        playlist.innerHTML = html.join('')
    },

    defaultNumber(num) {
        return num < 10 ? ('0' + num) : `${num}`
    },

    convertTime(time) {
        let minute = Math.floor(time / 60)
        let second = Math.floor(time - minute * 60)

        return `${this.defaultNumber(minute)}:${this.defaultNumber(second)}`
    },

    renderTimeSong(time, element) {
        element.innerHTML = this.convertTime(time)
    },

    loadCurrentSong() {
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        songName.innerHTML = this.currentSong.name
        songSinger.innerHTML = this.currentSong.singer
        this.currentSongElement.classList.add('active')
    },

    progressUpdate() {
        progress.style.width = `${inputRange.value}%`
    },

    timelineUpdate() {
        let songPlayedPercent = this.currentTime * 100 / this.duration

        inputRange.value = songPlayedPercent
        app.progressUpdate()
        app.renderTimeSong(this.currentTime, timeCurrent)
    },

    updateSongOnInput() {
        let newCurrentTime = inputRange.value * this.currentAudio.duration / 100

        this.currentAudio.currentTime = newCurrentTime
        this.currentAudio.addEventListener('timeupdate', this.timelineUpdate)

        if(this.isPlaying) {
            this.currentAudio.play()
        }
    },

    resetOldSong() {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
        this.currentSongElement.classList.remove('active')
    },

    updateTimeEnd() {
        timeEnd.innerHTML = this.currentSongElement.querySelector('.time').innerHTML
    },

    handleChangeSong() {
        this.updateTimeEnd()
        this.loadCurrentSong()
        this.handleEvent()
        this.currentAudio.play()
    },

    nextSong() {
        this.resetOldSong()

        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }

        this.handleChangeSong()
    },

    previousSong() {
        this.resetOldSong()

        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }

        this.handleChangeSong()
    },

    playRandomSong() {
        let random

        if(this.randomSongList.length === this.songs.length - 1) {
            this.randomSongList = [this.currentIndex]
        } else {
            this.randomSongList.push(this.currentIndex)
        }
        
        do {
            random = Math.floor(Math.random() * this.songs.length)
        } while(this.randomSongList.includes(random))
        
        this.resetOldSong()
        this.currentIndex = random
        this.handleChangeSong()
    },

    scrollToActiveSong() {
        let option
        let activeSong = get('.song.active')

        if(window.innerWidth <= 1024 && this.currentIndex < 1) {
            option = 'end'
        } else {
            option = 'center'
        }

        activeSong.scrollIntoView({
            behavior: 'smooth',
            block: option
        })
    },

    handleEvent() {
        // Lưu lại config của trang
        window.onbeforeunload = () => {
            this.setConfig('currentIndex', this.currentIndex)
            this.setConfig('audioCurrentTime', this.currentAudio.currentTime)
            this.setConfig('isRandom', this.isRandom)
            this.setConfig('isRepeat', this.isRepeat)
        }

        // Xử lý tải lên thời gian bài hát
        getAll('.playlist audio').forEach((audio, index)=> {
            audio.onloadedmetadata = (e) => {
                this.renderTimeSong(e.target.duration, e.target.parentElement.querySelector('.time'))

                if(index === this.currentIndex) {
                    this.renderTimeSong(audio.currentTime, timeCurrent)
                    this.renderTimeSong(audio.duration, timeEnd)
                }
            }
        })

        // Xử lý CD khi cuộn
        playlist.onscroll = () => {
            if(window.innerWidth <= 1024) {
                let cdWidth = 150
                let scrollTop = playlist.scrollTop
                let newCdWidth = cdWidth - scrollTop
    
                cd.style.width = `${newCdWidth > 0 ? newCdWidth : 0}px`
                cd.style.opacity = newCdWidth / cdWidth
            }
        }

        // Khi nhấn nút play
        playBtn.onclick = () => {
            if(this.isPlaying) {
                this.currentAudio.pause()
            } else {
                this.currentAudio.play()
            }
        }

        // Khi bài hát được play
        this.currentAudio.onplay = () => {
            this.isPlaying = true
            main.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi bài hát bị dừng
        this.currentAudio.onpause = () => {
            this.isPlaying = false
            main.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi bài hát đang play
        this.currentAudio.addEventListener('timeupdate', this.timelineUpdate)

        // Khi tua bài hát
        inputRange.oninput = (e) => {
            let timeOnInput = e.target.value * this.currentAudio.duration / 100

            this.currentAudio.removeEventListener('timeupdate', this.timelineUpdate)
            this.progressUpdate()
            this.renderTimeSong(timeOnInput, timeCurrent)

            e.target.onmouseup = () => {
                this.updateSongOnInput()
            }

            e.target.ontouchend = () => {
                this.updateSongOnInput()
            }
        }

        // Khi nhấn nút next song
        nextBtn.onclick = () => {
            if(this.isRandom) {
                this.playRandomSong()
            } else {
                this.nextSong()
            }

            this.scrollToActiveSong()
        }

        // Khi nhấn nút previous song
        prevBnt.onclick = () => {
            if(this.isRandom) {
                this.playRandomSong()
            } else {
                this.previousSong()
            }

            this.scrollToActiveSong()
        }

        // Khi nhấn nút random
        randomBtn.onclick = () => {
            this.isRandom = !this.isRandom
            randomBtn.classList.toggle('active', this.isRandom)
        }

        // Khi nhấn nút vòng lặp
        repeatBtn.onclick = () => {
            this.isRepeat = !this.isRepeat
            repeatBtn.classList.toggle('active', this.isRepeat)
        }

        // Khi kết thúc bài hát
        this.currentAudio.onended = (e) => {
            if(this.isRepeat) {
                e.target.play()
            } else {
                nextBtn.click()
            }
        }

        // Khi nhấn vào bài hát trong playlist
        let songList = getAll('.song')
        
        songList.forEach((song, index) => {
            song.onclick = () => {
                this.resetOldSong()
                this.currentIndex = index
                this.handleChangeSong()
                this.scrollToActiveSong()
            }
        })        
    },

    start() {
        this.render()

        this.loadConfig()
        
        this.defineProperties()
        
        this.handleEvent()
        
        this.loadCurrentSong()
    }
}

app.start()