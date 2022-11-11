/**
 * 1. render songs 
 * 2. scroll top
 * 3. play / pause / seek
 * 4. CD rotate
 * 5. next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active into view
 * 10.  play song when click
 */


// Các bug cần xử lý
/* 1. Seek song
    2. Hạn chế  lặp lại song khi random  
    3. active song khi render laị sẽ bị load lại song gây lag app
    4. khi scrollInToView lên song đầu
    5. Lưu những option lại
    */
    





const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const playList = $('.playlist')
const songName = $('header h2')  
const cd = $('.cd')
const imageCd = $('.cd-thumb')
const audio = $('audio')
const playBtn = $('.btn.btn-toggle-play')
const player = $('.player')
const progress = $('.progress')
const btnNext = $('.btn-next')
const btnPrev = $('.btn-prev')
const btnRandom = $('.btn.btn-random')
const repeatBtn = $('.btn.btn-repeat')







const app = {
    currentIndex: 1,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    songs: [
        { 
            name: 'Cưới Thôi',
            singer: 'Bray, Masew',
            path: './music/CuoiThoi.mp3',
            image: './img/CuoiThoi.jpg'
        }, 
        { 
            name: 'Ái Nộ',
            singer: 'Masew, Khôi Vũ',
            path: './music/AiNo.mp3',
            image: './img/AiNo.jpg'
        },
        { 
            name: 'Phép Màu',
            singer: 'Bray',
            path: './music/PhepMau.mp3',
            image: './img/phepmau.jpeg'
        },
        { 
            name: 'For Get Me Now',
            singer: 'Cukak, Trí Dũng',
            path: './music/ForgetMeNow.mp3',
            image: './img/forgetmenow.jpeg'
        },
        { 
            name: 'Tình Ca Tình Ta',
            singer: 'kis, minnx',
            path: './music/TinhCaTinhTa-KIS-7040221.mp3',
            image: './img/tinhcatinhta.jpeg'
        },
        { 
            name: 'yêu 5',
            singer: 'rhymastic',
            path: './music/Yeu5-Rhymastic-4756973.mp3',
            image: './img/yeu5.jpeg'
        }
    ] ,

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    render: function () {

        // render song
        const htmls = this.songs.map((song,index) => {
            return `
                    <div  class="song ${this.currentIndex === index ? 'active' : ' '}" data-index = ${index}>
                            <div  class="thumb" style="background-image: url('${song.image}')">
                            </div>
                            <div class="body">
                                <h3 class="title">${song.name}</h3>
                                <p class="author">${song.singer}</p>
                            </div>
                            <div class="option">
                                <i class="fas fa-ellipsis-h"></i>
                            </div>
                </div>
          `
        })
     
        playList.innerHTML = htmls.join('');
    },

    handleEvent: function () {
    //  Xử lý CD quay và dừng
        const cdAnimate =  cd.animate([
                                                        { transform: 'rotate(360deg)' }
                                                    ],   {  
                                                            duration: 10000,
                                                            iterations: Infinity 
                                                        } 
                                                    )
       cdAnimate.pause()

    // xử lý phóng to/ thu nhỏ CD
        const cdWidth = cd.offsetWidth;
        document.onscroll = function() {
        const scrollTop = document.documentElement.scrollTop || window.scrollY;
        const newCdWidth = cdWidth - scrollTop 
            
        if (newCdWidth >= 0) {
            cd.style.width = newCdWidth + 'px'
        } else {
            cd.style.width = 0
        }

        cd.style.opacity = newCdWidth / cdWidth
        }
        
        // Xử lý khi click play
        const _this = this
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }   

        // khi song  play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdAnimate.play()
        }

        // khi song pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdAnimate.pause()
        }

        
       
        //  khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const songProgression = audio.currentTime / audio.duration * 100
            progress.value = songProgression
            }
        }

        
        
        // xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime =  audio.duration * e.target.value / 100
            audio.currentTime = seekTime             
        }

        // Xử lý next song
        btnNext.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong()                   
            } else {
               _this.nextSong()
            }  
            _this.render()
            audio.play()
            _this.scrollToActiveSong()
        }

         // Xử lý prev song
         btnPrev.onclick = function() {
             if (_this.isRandom) {
                 _this.randomSong()            
             } else {
                _this.prevSong()  
             }
             _this.render()
             audio.play()
             _this.scrollToActiveSong()
        }

        //  xử lý nút ramdon song
        btnRandom.onclick = function() {
            _this.isRandom = !_this.isRandom
            btnRandom.classList.toggle('active', _this.isRandom)
        }

        //  Xử lý khi lặp lại một song
        repeatBtn.onclick = function() {
        _this.isRepeat = !_this.isRepeat
        repeatBtn.classList.toggle('active', _this.isRepeat)
    }

        // Xử lý next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                btnNext.click()
            }
        }
        // Lắng nghe hành vi khi click vào playlist
        playList.onclick = function(e) { 
            const songNote = e.target.closest('.song:not(.active)')
            if(songNote || e.target.closest('.song .option')) {
                   // Xử lý khi click vào song
                   if(songNote) {
                        _this.currentIndex = Number(songNote.getAttribute('data-index')) 
                        // thay vì dùng getAbtribute ta có thể dùng dataset.index
                       _this.render()
                       _this.loadCurrentSong()
                       audio.play()
                   }    
            }
        }
        
    },

    loadCurrentSong: function() {
        // render 
        songName.innerText = this.currentSong.name
        imageCd.style.backgroundImage = 'url(' + this.currentSong.image + ')' 
        audio.src = this.currentSong.path
    },

    nextSong: function() {

            if(this.currentIndex < this.songs.length - 1) {
                this.currentIndex++
            } else  {
                this.currentIndex = 0
            }
            this.loadCurrentSong()
    },

    prevSong: function() {
            if(this.currentIndex > 0) {
                this.currentIndex--          
            } else  {
                this.currentIndex = this.songs.length - 1           
            }
        this.loadCurrentSong()
    },

    randomSong: function() {
        let newIndex
        do {
             newIndex = Math.floor(Math.random() * this.songs.length)
        } while (this.currentIndex === newIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior: "smooth", 
                block: "nearest", 
            })
        }, 100)
    },

    start: function() {
        // Định nghĩa cho các thuộc tính Object
        this.defineProperties()

        // Lắng nghe xử lý các sự kiện DOM(event)
        this.handleEvent()

        // Render playlist
        this.render()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

    }
}

app.start()



