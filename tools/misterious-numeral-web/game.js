
"use strict";

/* ===================== 游戏状态 ===================== */
const G = {
  min: 0,
  max: 20,
  magic: 0,
  guess: 0,
  gold: 0,          // 本轮金币
  gem: 0,           // 本轮宝石
  totalgem: 0,      // 总宝石
  totalgold: 0,     // 总金币
  counter: 0,       // 本轮猜测次数
  totalcounter: 0,  // 总猜测次数
  score: 0,
  victory: 0,
  glorycounter: 0,
  hero: "赣州枪手",
  flag1continues: 0,
  roundActive: false,
  oneHitDone: false
};

/* ===================== 工具函数 ===================== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showScreen(id) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  $("#" + id).classList.add("active");
  // 小屏显示浮动返回按钮（主菜单不显示）
  const isMenu = (id === "menuScreen");
  $("#floatingBack").style.display = isMenu ? "none" : (window.innerWidth <= 480 ? "block" : "none");
  window.scrollTo(0, 0);
}

function openModal(title, bodyHTML, actions) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHTML;
  $("#modalActions").innerHTML = "";
  actions.forEach(a => {
    const b = document.createElement("div");
    b.className = "btn" + (a.accent ? " btn-accent" : "");
    b.textContent = a.label;
    b.onclick = a.onClick;
    $("#modalActions").appendChild(b);
  });
  $("#overlay").classList.add("active");
}
function closeModal() { $("#overlay").classList.remove("active"); }

/* ===================== 加载动画 ===================== */
function runLoading() {
  let pct = 0;
  const bar = $("#loadBar");
  const txt = $("#loadPct");
  const timer = setInterval(() => {
    pct += Math.random() * 18 + 6;
    if (pct >= 100) { pct = 100; clearInterval(timer); finishLoading(); }
    bar.style.width = pct + "%";
    txt.textContent = Math.floor(pct) + "%";
  }, 160);
}
function finishLoading() {
  setTimeout(() => {
    $("#loading").classList.add("hide");
    setTimeout(() => { $("#loading").style.display = "none"; }, 500);
  }, 300);
}

/* ===================== 源码注入 ===================== */
const C_SOURCE = `/* ============================================================
   Mysterious Numeral (LJL版) - main.c
   开发者：李义洵  |  endril.com
   ============================================================ */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <string.h>

#define RESET   "\\033[0m"
#define RED     "\\033[31m"      /* Red */
#define GREEN   "\\033[32m"      /* Green */
#define YELLOW  "\\033[33m"      /* Yellow */
#define BLUE    "\\033[34m"      /* Blue */
#define MAGENTA "\\033[35m"      /* Magenta */
#define CYAN    "\\033[36m"      /* Cyan */
#define WHITE   "\\033[37m"      /* White */


                //#[函数原型声明]#//
long long Functolalgold(long long gold );
void Setting(void);
void Flush(void);

                 //#[函数模块区]#//
   long long Functolalgold(long long gold )//金币计算函数
   {
       static long long totalgold=0;
       totalgold=totalgold+gold;
       return totalgold;
   }


   void Flush(void)//清除缓冲区字符，为重新输入做准备
   {
       fflush(stdin);
       printf(RED"存在无效输入,请检查后重新输入（提示：输入格式错误或超出输入范围）^-^"RESET"\\a\\n\\n");
   }/*！！！开始猜数时do while bug(当guess==magic时跳不出循环）的问题根源在函数模块区！！！去除函数模块区后do while运行正常*/

   long long checkinput1d(void)//scanf一个整数并检查输入格式是否为一个整数，但未限制输入个数所以之后注意要加上fflush()避免影响下次scanf
   {
       long long input;
       int check;
       check=scanf(" %d",&input);
       while(check!=1)
       {
           Flush();
           check=scanf(" %d",&input);
       };
       return input;
   }


   int Question(void)//回答IQ问题
   {
       int ranselection;
       int restart=0;
       int check,check1;
       char answer;
         printf("<请回答以下IQ问题，若回答正确则可继续猜或重新再玩一局，若回答错误则将彻底结束游戏>\\n\\n");
         printf("                                按enter键继续\\n\\n");
reinput: printf("输入数字1或2或3选择一道IQ题目然后按enter键确认:\\n\\n");

   check=scanf(" %d",&ranselection);//暂时无法限制输入个数
    while(check!=1)
    {
        Flush();
        check=scanf("%d",&ranselection);
    }
    switch(ranselection)
    {
    case 1:
       printf(" QUESTION:句子“This sentance conteins three mistake包含几个错误？”\\n");
       printf("          A.2    B.3    C.4    D.5\\n\\n");
       reanswer:
       printf("你选择[输入选项(A/B/C/D)后按回车键确认]：\\n");//暂时无法限制输入个数
       check1=scanf(" %c",&answer);
         while(check1!=1)
         {
             Flush();
             check1=scanf(" %c",&answer);
         }
             if(answer=='c'||answer=='C')
          {
               printf("\\n");
               printf("恭喜！回答正确^=^\\n\\n");
               restart=1;
           }
           else if(answer=='a'||answer=='A'||answer=='b'||answer=='B'||answer=='d'||answer=='D')
             {
                 printf("sorry，回答错误555……\\n\\n");
                 printf("\\n");
                 printf("   ****************\\n");
                 printf("***彻底GAME OVER了！***\\n");
                 printf("   ****************\\n\\n");
                 printf("       ╥﹏╥...\\n\\n");
             }
             else
             {
              Flush();
                goto reanswer;
             }
break;

    case 2:
       printf("QUESTION:When I was 14,my mother was 41 and she is now twice as old as I am.How old am I？”\\n");
       printf("         A.27   B.28   C.29    D.其它岁数\\n\\n");
           reanswer1:
       printf("你选择[输入选项(A/B/C/D)后按回车键确认]：\\n");//暂时无法限制输入个数
       check1=scanf(" %c",&answer);
         while(check1!=1)
         {
             Flush();
             check1=scanf(" %c",&answer);
         }
             if(answer=='a'||answer=='A')
          {
               printf("\\n");
               printf("恭喜！回答正确^=^\\n\\n");
               restart=1;
           }
           else if(answer=='c'||answer=='C'||answer=='b'||answer=='B'||answer=='d'||answer=='D')
             {
                 printf("sorry，回答错误555……\\n\\n");
                 printf("\\n");
                 printf("   ****************\\n");
                 printf("***彻底GAME OVER了！***\\n");
                 printf("   ****************\\n\\n");
                 printf("       ╥﹏╥...\\n\\n");
             }
             else
             {
              Flush();
                goto reanswer1;
             }
break;
    case 3:
       printf("QUESTION:On every birthday since I was born,I have had a cake decorated with the appropriate number of candles.\\n");
       printf("         I have blown out 210 candles so far,How old am I?\\n");
       printf("         A.21   B.20   C.19    D.其它岁数\\n\\n");
              reanswer2:
       printf("你选择[输入选项(A/B/C/D)后按回车键确认]：\\n");//暂时无法限制输入个数
       check1=scanf(" %c",&answer);
         while(check1!=1)
         {
             Flush();
             check1=scanf(" %c",&answer);
         }
             if(answer=='b'||answer=='B')
          {
               printf("\\n");
               printf("恭喜！回答正确^=^\\n\\n");
               restart=1;
           }
           else if(answer=='a'||answer=='A'||answer=='C'||answer=='c'||answer=='d'||answer=='D')
             {
                 printf("sorry，回答错误555……\\n\\n");
                 printf("\\n");
                 printf("   ****************\\n");
                 printf("***彻底GAME OVER了！***\\n");
                 printf("   ****************\\n\\n");
                 printf("       ╥﹏╥...\\n\\n");
             }
             else
             {
              Flush();
                goto reanswer2;
             }
break;

    default:
       printf("无效输入，请重新输入！\\a\\n");//输入c将无限循环
       goto reinput;
    }
      fflush(stdin);//清理缓冲区，避免影响下次scanf

      return restart;
   }

   void printfheros(char hero[][10],int n)//全部英雄列表，n指有n位英雄，m指英雄名称最长长度,未成功写出之后再写
   {
       int i;
       for(i=0;i<n;i++)
       {
          printf("%s\\n",hero[i][10]);
       }
   }

   void Heroimformation(void)//英雄信息
   {
    printf("            ① *赣州枪手*  主动技能1【赏金】：金币收益翻倍\\n");
    printf("            ② *画饼大王*  主动技能1【画饼】：免费复活一次\\n");
    printf("            ③ * 牛马怪 *  被动技能1【我是牛马】 无敌牛马 勇闯天下!\\n\\n");
   }


                 //#[主函数]#//
int main()
{
   long long magic,guess,gold=0,gem=0,totalgem=0;
   int ret,counter,totalcounter,score=0;
   int cey;//接受问题
   char reply,continues,setting;
   int flag1continues=0;
   char esc1;
   char esc2,flagesc2;//第二次返回主界面选项
   char flagesc1='n';
   int glorycounter=0;
   char glory1[4];
   long long  min=0,max=20;
   int victory;//游戏挑战成功标志
char hero[10]="赣州枪手";
char hero1[10]="赣州枪手";
char hero2[10]="画饼大王";
char hero3[10]="牛马怪";
//int flagh=1;//int flagh=1标志变量会扰乱程序，使程序出现大写比较错乱问题，如guess始终大于max
char h;//选择英雄序号选项标志

                //#[游戏程序]#//
      interface://游戏主界面

    flag1continues=0;


    printf("        *********************\\n");
    printf("  ***~~~|MYSTERIOUS NUMERALS|~~~***\\n");
    printf("        *********************\\n");
    printf("             (LJL版)\\n\\n\\n");
    printf("           [开始游戏] (A键+enter键）\\n\\n");
    printf("           [英雄详细] (O键+enter键）\\n\\n");
    printf("           [荣誉战绩] (H键+enter键）\\n\\n");
    printf("           [游戏设置] (S键+enter键）\\n\\n");

   reclick: scanf(" %c",&setting);

   if(setting=='s'||setting=='S')
   {
       printf("             ******\\n");
       printf("           ***设置***\\n");
       printf("             ******\\n\\n");
       printf("<请设置你想猜的整数范围并按enter键确认开始游戏>\\n\\n");
       printf("Mysterious Numeral最小为：");
       min=checkinput1d();//还未限制输入格式！！！

       printf("Mysterious Numeral最大为：");
       max=checkinput1d();
       printf("\\n");//游戏设置
   }

   else if(setting=='A'||setting=='a')
   {
       goto start;//游戏开始
   }
   else if(setting=='O'||setting=='o')
   {
      Heroimformation();//英雄信息
       do        //返回主界面选项
      {
       printf("        按A键+enter键继续（将不再允许返回主界面）\\n\\n");
       printf("         按E键+enter键返回主界面\\n\\n\\n");
       scanf(" %c",&esc1);
       if(esc1=='e'||esc1=='E')
       {
           flagesc1='1';
           goto interface;
       }
       else if(esc1=='a'||esc1=='A')
       {
           flagesc1='1';
       }
        else
      {
       Flush();//非法输入，重新输入
      }
      }while(flagesc1!='1');
   }

   else if(setting=='H'||setting=='h')
   {
       printf("           已获荣誉%d项\\n\\n",glorycounter);
       if(glorycounter>0)
       {
       printf("           **%s**\\n\\n","一击必杀！");
       }
    reclick1: printf("     按E键+enter键返回主界面\\n\\n\\n");
       scanf(" %c",&esc1);
       if(esc1=='e'||esc1=='E')
       {
           goto interface;
       }
        else
      {
       Flush();//非法输入，重新输入
      goto reclick1;
      }

   }
   else
{
    Flush();//非法输入，重新输入
    goto reclick;
}




do//游戏开始
{
                               start:

printf("              ★游戏已开始！★\\a\\n");
printf("               ヾ(≧▽≦*)o\\n");
printf("亲爱的召唤师，请输入英雄对应序号来选择你本次的探险英雄：\\n");//选择英雄
printf("               ① 赣州枪手\\n");
printf("               ② 画饼大王\\n");
printf("               ③  牛马怪\\n\\n");



do
{scanf(" %c",&h);//%c前面加空格吃掉上次输入后遗留的回车键字符  开始选择英雄 问题在这下片区域
switch(h)
{
case '1':
    strcpy(hero,hero1);
    h='0';
    break;
case '2':
    strcpy(hero,hero2);
    h='0';
    break;
case '3':
    strcpy(hero,hero3);
    h='0';
    break;
default:
    Flush();
}
}while(h!='0');//请输入英雄对应序号来选择你本次的探险英雄
printf("    英雄：*%s*    金币：%d枚    宝石：%d颗\\n\\n",hero,Functolalgold(0),totalgem);//选择英雄 问题在这上片区域*/
printf("规则：1.猜一个%d—%d的Myterious Numeral（整数）(默认设置为0-20）\\n",min,max);
printf("      2.单局游戏猜数次数最多10次\\n ");
printf("     3.挑战成功可再玩一局，挑战失败则接受IQ问题\\n ");
printf("     4.Myterious Numeral范围越大，得分越高；所猜次数越少，得分越高\\n ");
printf("     5.挑战难度越大,得分越高，可获得金币越多，且有几率挖到宝石\\n ");
printf("     6.投机取巧将不会获得金币和宝石\\n\\n ");

      do
      {
       printf("        按A键+enter键继续（将不再允许返回主界面）\\n\\n");
       printf("         按E键+enter键返回主界面\\n\\n\\n");
       scanf(" %c",&esc2);
       if(esc2=='e'||esc2=='E')
       {
           flagesc2='1';
           goto interface;
       }
       else if(esc2=='a'||esc2=='A')
       {
           flagesc2='1';
       }
        else
      {
       Flush();//非法输入，重新输入
      }
      }while(flagesc2!='1');
      fflush(stdin);                        //返回主界面或继续










        srand(time(NULL));
        magic=rand()%(max-min+1)+min;              //生成随机数
        //printf("magic=%ld\\n\\n",magic);
        totalcounter=0;//总计数

     continues: counter=0;
                //printf("counter=%d\\n\\n",counter);
                  gold=0;
                //printf("gold=%d\\n\\n",gold);
                  gem=0;
  do                                              //开始猜数
  {
                 victory=0;
     printf("请猜数(提示:◆Misterious Numeral是整数 ◆只读取输入的整数部分):");
     //printf("magic=%ld\\n\\n",magic);
     ret=scanf(" %ld",&guess);//暂时无法限制输入个数
     /*printf("guess=%ld\\n\\n",guess);
     printf("min=%ld\\n\\n",min);
     printf("max=%ld\\n\\n",max);
     printf("ret=%ld\\n\\n",ret);
     printf("guess>max=%d\\n",guess>max);
     printf("guess<min=%d\\n",guess<min);*/

     while((ret!=1)||(guess<min)||(guess>max))//阻止非法输入并检查是否超出范围
    { Flush();
       ret=scanf(" %d",&guess);
       //printf("guess=%ld\\n\\n",guess);
    }
     /*printf("magic=%ld\\n\\n",magic);
     printf("guess=%ld\\n\\n",guess);
     printf("magic<guess=%ld\\n",magic<guess);*/
    if(magic<guess)
    {
        /*printf("magic=%ld\\n\\n",magic);
        printf("guess=%ld\\n\\n",guess);*/
       printf("too high! 请重猜 \`(*>﹏<*)′\\a\\n\\n");
        /* printf("magic=%ld\\n\\n",magic);
        printf("guess=%ld\\n\\n",guess);*/
    }
    else if(magic>guess)
    {
       printf("too small！请重猜 {{{(>_<)}}}\\a\\n\\n");
    }
    else
    {
       printf("\\n\\n");
       printf("   *********\\n");
       printf("***挑战成功！***\\n");
       printf("   *********\\n");
       printf(" ヾ(≧▽≦*)o\\n\\n\\n");
       victory=1;
    }

     counter++;
    // printf("counter=%d\\n\\n",counter);
     totalcounter++;
     //printf("totalcounter=%d\\n\\n",totalcounter);
     score=100-(counter-1)*10;
     //printf("score=%d\\n\\n",score);

     if(flag1continues==0&&counter<=10)//如果没有选择继续游戏或没有失败，则可获得金币；若选择继续游戏，则不再获得金币
     {
       gold=(score/10)*(max-min)/(max+20)+(max-min)/5;
       //printf("gold=%d\\n\\n",gold);
     }//金币数量计算,但计算总金币出问题!!!

     if(counter==1&&(max-min)>=10&&guess==magic&&flag1continues==0)//如何获得荣誉
     {
        printf("   <恭喜获得一项荣誉>\\n\\n");//之后更新可获得多项荣誉
        printf("    **%s**\\n\\n\\n","一击必杀！");
        glorycounter++;
          if(flag1continues==0)
          {
              gem++;
              totalgem=totalgem+gem;
          }//没有选择继续游戏，获得荣誉即可获得宝石，宝石数量计算

      }
   }while((guess!=magic)&&(counter<10));//出现bug!!!当mgic==guess时跳不出循环？


   if(counter==10&&!victory)//gameover and goto question
   {
       printf("\\n");
       printf("   *********\\n");
       printf("***GAME OVER！***\\n");
       printf("   *********\\n");
       printf("     X﹏X\\n\\n");
       printf("本轮你猜了%d次^-^\\n\\n",counter);
       printf("整局游戏你一共猜了%d次^-^\\n\\n",totalcounter);
       printf("本轮得分：%d分    斩获金币：%d枚    发现宝石：%d颗^-^\\n\\n\\n",score,gold,gem);
       cey=0;
    cey=Question();//接受问题，问题函数返回值restart若为1，代表回答正确，程序执行跳转至CEY
       if(cey)
       {
           goto CEY;
       }
       else
       {
           fflush(stdin);
           getchar;
           exit(0);
       }
    }

       printf("本轮你猜了%d次^-^\\n\\n",counter);
       printf("整局游戏你一共猜了%d次^-^\\n\\n",totalcounter);
       printf("本轮得分：%d分哦    斩获金币：%d枚    发现宝石：%d颗^-^\\n\\n",score,gold,gem);
       if(flag1continues==0)
      {
       Functolalgold(gold);//本轮游戏结束计算总金币，若点了继续游戏则不计算
      }
      printf("【我的背包】：|%d枚金币| |%d颗宝石|\\n\\n",Functolalgold(0),totalgem);
   CEY:printf("          (继续：mysterious numeral不改变）do you want to continue the game?\\n         please input 'C' or 'c' and press the enter:\\n\\n");
       printf("         （结束：mysterious numeral将停止）do you want to end the game?\\n         please input 'E' or 'e' and press the enter:\\n\\n");
       printf("         （重启：mysterious numeral将改变)do you want to restart the game?\\n         please input 'Y' or 'y' and press the enter:\\n\\n");

       scanf(" %c",&reply);
       printf("           **************************************************************\\n");
       printf("           **************************************************************\\n\\n");

   }while(reply=='Y'||reply=='y');
if(reply=='e'||reply=='E')//退出游戏，终止程序
{
       fflush(stdin);
       printf("                      GoodBye~~~那下次再见噢o(*￣▽￣*)o");
       getchar();
       exit(0);
}
if(reply=='c'||reply=='C')//继续游戏
{
    flag1continues=1;
   goto continues;
}

    return 0;
}
`;

function injectSource() {
  $("#srcCode").textContent = C_SOURCE;
}

/* ===================== 游戏逻辑 ===================== */
function resetGameState() {
  G.gold = 0; G.gem = 0; G.totalgem = 0; G.totalgold = 0;
  G.counter = 0; G.totalcounter = 0; G.score = 0;
  G.victory = 0; G.glorycounter = 0; G.flag1continues = 0;
  G.hero = "赣州枪手"; G.roundActive = false; G.oneHitDone = false;
}

function startHeroSelect() {
  showScreen("heroSelectScreen");
}

function selectHero(n) {
  $$("#heroGrid .hero-card").forEach(c => c.classList.remove("selected"));
  const card = $(`#heroGrid .hero-card[data-hero="${n}"]`);
  card.classList.add("selected");
  G.hero = ["", "赣州枪手", "画饼大王", "牛马怪"][n];
  setTimeout(() => beginRound(true), 250);
}

function beginRound(fresh) {
  if (fresh) {
    G.counter = 0; G.gold = 0; G.gem = 0;
    G.magic = Math.floor(Math.random() * (G.max - G.min + 1)) + G.min;
    G.roundActive = true;
    G.victory = 0;
  }
  showScreen("gameScreen");
  updateGameHUD();
  renderRules();
  renderDots();
  $("#guessInput").value = "";
  $("#guessInput").focus();
  $("#feedback").innerHTML = '<span class="fb-info">请猜数（提示：◆Misterious Numeral 是整数 ◆只读取输入的整数部分）</span>';
}

function renderRules() {
  $("#gameRules").innerHTML =
    '<span class="rnum">1.</span> 猜一个 ' + G.min + '—' + G.max + ' 的 Mystery Numeral（整数，默认0-20）<br>' +
    '<span class="rnum">2.</span> 单局最多猜 10 次<br>' +
    '<span class="rnum">3.</span> 挑战成功可再玩一局，失败则接受IQ问题<br>' +
    '<span class="rnum">4.</span> 范围越大/次数越少 → 得分越高<br>' +
    '<span class="rnum">5.</span> 难度越大 → 金币越多，有几率挖到宝石<br>' +
    '<span class="rnum">6.</span> 投机取巧不会获得金币和宝石';
}

function renderDots() {
  const wrap = $("#attemptsDots");
  wrap.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const d = document.createElement("div");
    d.className = "dot";
    wrap.appendChild(d);
  }
}

function updateGameHUD() {
  $("#gHero").textContent = G.hero;
  $("#gGold").textContent = G.totalgold;
  $("#gGem").textContent = G.totalgem;
  $("#gScore").textContent = G.score;
}

function updateDots() {
  const dots = $$("#attemptsDots .dot");
  for (let i = 0; i < dots.length; i++) {
    if (i < G.counter) {
      dots[i].classList.add(G.victory && i === G.counter - 1 ? "win" : "used");
    }
  }
}

function submitGuess() {
  if (!G.roundActive) return;
  const raw = $("#guessInput").value.trim();
  if (raw === "") {
    flashFeedback("请输入一个数字！", "fb-info");
    return;
  }
  let g = parseInt(raw, 10);
  if (isNaN(g) || g < G.min || g > G.max) {
    flashFeedback("无效输入！请输入 " + G.min + " 到 " + G.max + " 之间的整数。", "fb-info");
    $("#guessInput").value = "";
    return;
  }
  G.guess = g;

  if (G.magic < g) {
    flashFeedback("too high! 请重猜 `(*>﹏<*)′", "fb-high");
  } else if (G.magic > g) {
    flashFeedback("too small！请重猜 {{{(>_<)}}}", "fb-low");
  } else {
    flashFeedback("*** 挑战成功！***  ヾ(≧▽≦*)o", "fb-win");
    G.victory = 1;
  }

  G.counter++;
  G.totalcounter++;
  G.score = Math.max(0, 100 - (G.counter - 1) * 10);

  if (G.flag1continues === 0 && G.counter <= 10) {
    G.gold = Math.floor((G.score / 10) * (G.max - G.min) / (G.max + 20) + (G.max - G.min) / 5);
  }

  // 一击必杀荣誉
  if (G.counter === 1 && (G.max - G.min) >= 10 && g === G.magic && G.flag1continues === 0) {
    G.glorycounter++;
    if (G.flag1continues === 0) { G.gem++; G.totalgem += G.gem; }
    setTimeout(() => flashFeedback("★ <恭喜获得荣誉：一击必杀！> ★", "fb-win"), 50);
  }

  updateDots();
  updateGameHUD();
  $("#guessInput").value = "";
  $("#guessInput").focus();

  if (G.victory) {
    endRound(true);
  } else if (G.counter >= 10) {
    endRound(false);
  }
}

function flashFeedback(msg, cls) {
  const f = $("#feedback");
  f.innerHTML = '<span class="' + (cls || "fb-info") + '">' + msg + "</span>";
}

function endRound(win) {
  G.roundActive = false;
  if (win) {
    if (G.flag1continues === 0) G.totalgold += G.gold;
    updateGameHUD();
    showRoundEndModal(false);
  } else {
    // GAME OVER -> IQ 问题
    showIQQuestion();
  }
}

function showRoundEndModal(gameOver) {
  autoRecord(); // 自动记录战绩到数据系统
  const title = gameOver ? "*** GAME OVER！***" : "本轮结束";
  const body =
    "本轮你猜了 <b style='color:var(--accent)'>" + G.counter + "</b> 次<br>" +
    "整局一共猜了 <b style='color:var(--accent)'>" + G.totalcounter + "</b> 次<br>" +
    "本轮得分：<b style='color:var(--accent)'>" + G.score + "</b> 分<br>" +
    "斩获金币：<b style='color:var(--accent)'>" + G.gold + "</b> 枚<br>" +
    "发现宝石：<b style='color:var(--accent)'>" + G.gem + "</b> 颗<br><br>" +
    "【我的背包】：|" + G.totalgold + "枚金币| |" + G.totalgem + "颗宝石|";
  openModal(title, body, [
    { label: "(Y) 重启新数", accent: true, onClick: () => { closeModal(); G.flag1continues = 0; beginRound(true); } },
    { label: "(C) 继续(同数)", onClick: () => { closeModal(); G.flag1continues = 1; beginRound(true); } },
    { label: "(E) 结束游戏", onClick: () => { closeModal(); showScreen("menuScreen"); } }
  ]);
}

/* IQ 问题（原C版3题随机） */
const IQ_QUESTIONS = [
  {
    q: '句子 "This sentance conteins three mistake" 包含几个错误？',
    opt: ["A.2", "B.3", "C.4", "D.5"],
    ans: "C"
  },
  {
    q: "When I was 14, my mother was 41 and she is now twice as old as I am. How old am I?",
    opt: ["A.27", "B.28", "C.29", "D.其它岁数"],
    ans: "A"
  },
  {
    q: "I have blown out 210 candles so far (birthday cakes). How old am I?",
    opt: ["A.21", "B.20", "C.19", "D.其它岁数"],
    ans: "B"
  }
];

function showIQQuestion() {
  const q = IQ_QUESTIONS[Math.floor(Math.random() * IQ_QUESTIONS.length)];
  // 构建带选项按钮的 body
  const optHtml = q.opt.map(o => `<button class="btn btn-sm iq-opt" data-ans="${o.charAt(0)}">${o}</button>`).join("");
  const body = `
    <div style="text-align:left;line-height:2;font-size:clamp(11px,2.2vw,13px);color:#f4f4f4;">${q.q}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:14px;">
      ${optHtml}
    </div>
  `;
  openModal("*** GAME OVER！*** 回答IQ问题", body, []);
  // 绑定选项点击（延迟确保 DOM 已渲染）
  setTimeout(() => {
    $$(".iq-opt").forEach(btn => {
      btn.onclick = () => {
        closeModal();
        const picked = btn.dataset.ans.toUpperCase();
        if (picked === q.ans) {
          openModal("恭喜！回答正确 ^=^", "你可以继续再玩一局！", [
            { label: "继续游戏", accent: true, onClick: () => { closeModal(); G.flag1continues = 0; beginRound(true); } }
          ]);
        } else {
          openModal("sorry，回答错误 555……", "*** 彻底 GAME OVER 了！ ***<br>╥﹏╥...", [
            { label: "结束游戏", accent: true, onClick: () => { closeModal(); showScreen("menuScreen"); } }
          ]);
        }
      };
    });
  }, 0);
}

/* ===================== 事件绑定 ===================== */
/* ===== 字体缩放 & 折叠 ===== */
function applyFontScale(val) {
  const scale = val / 100;
  document.documentElement.style.setProperty("--font-scale", scale);
  $("#fontSizeVal").textContent = val + "%";
  // 持久化字体设置
  localStorage.setItem("mn_font_scale", val);
}

function toggleDocx() {
  const body = $("#docxBody");
  const btn = $("#docxToggle");
  if (body.classList.contains("open")) {
    body.classList.remove("open");
    btn.textContent = "▼ 展开编程经历";
  } else {
    body.classList.add("open");
    btn.textContent = "▲ 收起编程经历";
  }
}

function bindEvents() {
  // 菜单按钮
  $$(".menu-buttons .btn").forEach(b => {
    b.onclick = () => handleMenuAction(b.dataset.action);
  });

  // 返回按钮
  $$("[data-back]").forEach(b => {
    b.onclick = () => { showScreen("menuScreen"); };
  });
  $("#floatingBack").onclick = () => showScreen("menuScreen");

  // 设置确认
  $("#confirmSettings").onclick = () => {
    let mn = parseInt($("#setMin").value, 10);
    let mx = parseInt($("#setMax").value, 10);
    if (isNaN(mn)) mn = 0;
    if (isNaN(mx)) mx = 20;
    if (mn >= mx) { alert("最小值必须小于最大值！"); return; }
    G.min = mn; G.max = mx;
    startHeroSelect();
  };

  // 字体大小滑块
  const slider = $("#fontSlider");
  if (slider) {
    slider.addEventListener("input", () => { applyFontScale(parseInt(slider.value, 10)); });
    // 初始化应用默认值
    applyFontScale(parseInt(slider.value, 10));
  }

  // 查看源码（设置页内按钮）
  $("#viewSourceBtn").onclick = () => { injectSource(); showScreen("srcScreen"); };

  // 英雄选择
  $$("#heroGrid .hero-card").forEach(c => {
    c.onclick = () => selectHero(parseInt(c.dataset.hero, 10));
  });

  // 提交猜测
  $("#submitGuess").onclick = submitGuess;
  $("#guessInput").addEventListener("keydown", (e) => { if (e.key === "Enter") submitGuess(); });

  // 键盘快捷键
  document.addEventListener("keydown", (e) => {
    const active = $(".screen.active");
    const id = active ? active.id : "";
    // 仅在菜单时响应快捷键
    if (id === "menuScreen") {
      const k = e.key.toLowerCase();
      if (k === "a") handleMenuAction("start");
      else if (k === "o") handleMenuAction("heroes");
      else if (k === "s") handleMenuAction("settings");
      else if (k === "d") handleMenuAction("data");
    }
    // 源码/英雄/设置 界面按E返回（gloryScreen 已合并入游戏管理）
    if (["srcScreen","heroesScreen","settingsScreen","heroSelectScreen","dataScreen"].includes(id)) {
      if (e.key.toLowerCase() === "e") showScreen("menuScreen");
    }
    // 游戏界面按E返回（非输入聚焦时）
    if (id === "gameScreen" && e.key.toLowerCase() === "e" && document.activeElement !== $("#guessInput")) {
      showScreen("menuScreen");
    }
  });
}

function handleMenuAction(action) {
  switch (action) {
    case "start": startHeroSelect(); break;
    case "heroes": showScreen("heroesScreen"); break;
    case "settings": showScreen("settingsScreen"); break;
    case "data": showDataScreen(); break;
  }
}

/* ===================== 数据管理系统 ===================== */
const DATA_KEY = "mn_data_v1";

/* 头像库（像素风 emoji / 符号） */
const AVATAR_LIST = [
  "😎","🧙‍♂️","👾","🤖","🦊","🐉",
  "👻","🦄","🐱","🔥","⚡","🌟",
  "🎮","🗡️","🛡️","👽","🎯","🐙"
];
let currentProfile = { name: "", totalGames: 0, totalGold: 0, totalGem: 0, highScore: 0, oneHitKills: 0, history: [], createdAt: "", avatar: "😎" };

function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) currentProfile = JSON.parse(raw);
  } catch(e) {}
  // 确保字段完整
  if (!currentProfile.history) currentProfile.history = [];
  if (!currentProfile.createdAt) currentProfile.createdAt = new Date().toISOString();
  if (!currentProfile.avatar || !AVATAR_LIST.includes(currentProfile.avatar)) currentProfile.avatar = "😎";
}
function saveData() {
  localStorage.setItem(DATA_KEY, JSON.stringify(currentProfile));
}

function showDataScreen() {
  loadData();
  updateDataUI();
  renderGloryTab();
  showScreen("dataScreen");
  // 绑定标签切换
  $$(".tab-btn").forEach(btn => btn.onclick = () => switchDataTab(btn.dataset.tab));
  // 截图按钮
  $("#screenshotBtn").onclick = captureScreenshot;
}

/* ===== 荣誉 Tab 渲染 ===== */
function renderGloryTab() {
  const gc = G.glorycounter || 0;
  $("#gloryCount").textContent = "已获荣誉 " + gc + " 项";
  $("#gloryList").innerHTML = gc > 0 ? "** 一击必杀！ **" : "（暂无荣誉，去挑战一击必杀吧！）";
}

/* ===== 头像选择弹面板 ===== */
function openAvatarModal() {
  const grid = $("#modalAvatarGrid");
  grid.innerHTML = "";
  AVATAR_LIST.forEach(a => {
    const opt = document.createElement("div");
    opt.className = "avatar-modal-opt" + (currentProfile.avatar === a ? " selected" : "");
    opt.textContent = a;
    opt.onclick = () => { currentProfile.avatar = a; saveData(); $$("#modalAvatarGrid .avatar-modal-opt").forEach(o => o.classList.toggle("selected", o.textContent === a)); };
    grid.appendChild(opt);
  });
  $("#avatarModal").classList.add("active");
}

function closeAvatarModal() {
  $("#avatarModal").classList.remove("active");
  // 同步预览头像
  const av = (currentProfile.avatar && AVATAR_LIST.includes(currentProfile.avatar)) ? currentProfile.avatar : "😎";
  $("#profileAvatar").textContent = av;
}

function switchDataTab(tabId) {
  $$(".tab-btn").forEach(b => b.classList.remove("active"));
  $$(".tab-content").forEach(c => c.classList.remove("active"));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
  $(`#tab-${tabId}`).classList.add("active");
  if (tabId === "history") renderHistory();
  if (tabId === "rank") renderRank();
}

function updateDataUI() {
  $("#dTotalGames").textContent = currentProfile.totalGames;
  $("#dTotalGold").textContent = currentProfile.totalGold;
  $("#dTotalGem").textContent = currentProfile.totalGem;
  $("#dHighScore").textContent = currentProfile.highScore;
  $("#dOneHit").textContent = currentProfile.oneHitKills || 0;
  $("#profileNameInput").value = currentProfile.name || "";
  // 头像
  const av = (currentProfile.avatar && AVATAR_LIST.includes(currentProfile.avatar)) ? currentProfile.avatar : "😎";
  $("#profileAvatar").textContent = av;
}

function saveProfile() {
  currentProfile.name = $("#profileNameInput").value.trim();
  saveData();
  updateDataUI();
  openModal("已保存", "✅ 档案已保存到本地浏览器", [{ label: "好的", accent: true, onClick: closeModal }]);
}

/* ===== 历史记录 ===== */
function recordGame(result) {
  /* result: { rounds, totalGuesses, score, gold, gem, victory, hero, range } */
  const entry = {
    id: Date.now(),
    date: new Date().toLocaleString("zh-CN"),
    ...result
  };
  currentProfile.history.unshift(entry);
  if (currentProfile.history.length > 100) currentProfile.history = currentProfile.history.slice(0, 100);
  currentProfile.totalGames++;
  currentProfile.totalGold += result.gold || 0;
  currentProfile.totalGem += result.gem || 0;
  if ((result.score || 0) > currentProfile.highScore) currentProfile.highScore = result.score;
  // 一击必杀统计（首猜即中）
  if (result.victory && result.rounds === 1) currentProfile.oneHitKills++;
  saveData();
}

function renderHistory() {
  const list = $("#historyList");
  if (!currentProfile.history || currentProfile.history.length === 0) {
    list.innerHTML = '<div class="empty-hint">暂无战绩记录，去玩一局吧！</div>';
    return;
  }
  let html = '<div class="h-row header"><span class="idx">#</span><span>日期</span><span>得分</span><span>金币</span><span>宝石</span></div>';
  currentProfile.history.forEach((h, i) => {
    html += `<div class="h-row">
      <span class="idx">${i + 1}</span>
      <span>${h.date.split(" ")[0]}</span>
      <span class="h-score">${h.score || 0}</span>
      <span class="h-gold">${h.gold || 0}</span>
      <span class="h-gem">${h.gem || 0}</span>
    </div>`;
  });
  list.innerHTML = html;
}

/* ===== 排行榜（基于单轮得分） ===== */
function renderRank() {
  const list = $("#rankList");
  if (!currentProfile.history || currentProfile.history.length === 0) {
    list.innerHTML = '<div class="empty-hint">排行榜为空，去挑战高分吧！</div>';
    return;
  }
  const sorted = [...currentProfile.history].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 20);
  let cls = ["gold", "silver", "bronze"];
  let html = '<div class="r-row header"><span class="idx">#</span><span>英雄</span><span>得分</span><span>金币</span><span>日期</span></div>';
  sorted.forEach((r, i) => {
    const c = i < 3 ? ` ${cls[i]}` : "";
    html += `<div class="r-row${c}">
      <span class="idx">${i + 1}</span>
      <span>${r.hero || "-"}</span>
      <span style="color:var(--green);font-weight:bold;">${r.score || 0}</span>
      <span>${r.gold || 0}</span>
      <span style="color:#8888aa;font-size:8px;">${(r.date||"").split(" ")[0]}</span>
    </div>`;
  });
  list.innerHTML = html;
}

/* ===== 导入/导出 ===== */
function exportData() {
  saveData(); // 先保存最新数据
  const blob = new Blob([JSON.stringify(currentProfile, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `mysterious_numerals_save_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  openModal("导出成功", "📤 存档文件已开始下载", [{ label: "好的", accent: true, onClick: closeModal }]);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // 合并而非覆盖：保留当前 profile 的 history 不被清空
      Object.assign(currentProfile, data);
      if (!data.history) data.history = []; // 防止空历史
      saveData();
      updateDataUI();
      openModal("导入成功", "✅ 存档已加载！", [{ label: "好的", accent: true, onClick: closeModal }]);
    } catch(err) {
      openModal("导入失败", "⚠️ 文件格式不正确", [{ label: "好的", accent: true, onClick: closeModal }]);
    }
  };
  reader.readAsText(file);
  event.target.value = ""; // reset for re-import
}

/* ===== 清除本地数据 ===== */
function clearAllData() {
  openModal("⚠️ 确认清除？", "此操作将永久删除所有本地游戏数据（档案、历史、排行），且不可恢复！<br><br>建议先「导出存档」备份。", [
    { label: "确认清除", accent: true, onClick: () => {
      localStorage.removeItem(DATA_KEY);
      currentProfile = { name: "", totalGames: 0, totalGold: 0, totalGem: 0, highScore: 0, oneHitKills: 0, history: [], avatar: "", createdAt: "" };
      updateDataUI();
      renderHistory(); renderRank();
      closeModal();
      openModal("已清除", "🗑️ 所有本地数据已清空", [{ label: "好的", accent: true, onClick: closeModal }]);
    }},
    { label: "取消", onClick: closeModal }
  ]);
}

/* ===== 战绩截图 ===== */
function captureScreenshot() {
  // 使用 html2canvas 方案不可行（无依赖），改用原生 canvas + foreignObject 或简化方案：
  // 将当前游戏状态渲染为文字卡片截图
  const canvas = document.createElement("canvas");
  const w = 480, h = 320;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");

  // 背景
  ctx.fillStyle = "#3a3f5c";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#11111b"; ctx.lineWidth = 4; ctx.strokeRect(2, 2, w - 4, h - 4);

  // 标题
  ctx.fillStyle = "#ffcd75";
  ctx.font = 'bold 16px "Press Start 2P",monospace';
  ctx.textAlign = "center";
  ctx.fillText("MYSTERIOUS NUMERALS", w / 2, 36);
  ctx.font = '9px "Press Start 2P",monospace';
  ctx.fillStyle = "#73eff7";
  const av = (currentProfile.avatar && currentProfile.avatar.length > 0) ? currentProfile.avatar : "😎";
  const nm = (currentProfile.name || "匿名");
  ctx.fillText("战绩报告 · " + nm, w / 2, 56);

  // 头像（居中放大显示）
  ctx.font = '48px sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(av, w / 2, 115);

  // 数据（紧凑排列）
  ctx.fillStyle = "#f4f4f4";
  ctx.font = '11px monospace';
  ctx.textAlign = "left";
  const lines = [
    "总场次: " + currentProfile.totalGames,
    "总金币: " + currentProfile.totalGold + " 枚",
    "总宝石: " + currentProfile.totalGem + " 颗",
    "最高分: " + currentProfile.highScore,
    "一击必杀: " + (currentProfile.oneHitKills || 0) + " 次",
    "",
    "--- endril.com ---"
  ];
  lines.forEach((line, i) => { ctx.fillText(line, 30, 150 + i * 22); });

  // 导出
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url; a.download = `mn_report_${Date.now()}.png`;
  a.click();

  // 同时预览
  const preview = document.getElementById("screenshotPreview") || (() => {
    const d = document.createElement("div"); d.id = "screenshotPreview"; d.className = "overlay";
    d.innerHTML = '<img id="ssImg"><div class="btn" style="position:absolute;bottom:20px;" onclick="this.parentElement.classList.remove(\'active\')">关闭</div>';
    document.body.appendChild(d);
    return d;
  })();
  preview.classList.add("active");
  document.getElementById("ssImg").src = url;

  openModal("截图完成", "📸 战绩截图已下载！<br>同时可在上方预览。", [
    { label: "关闭预览", onClick: () => { preview.classList.remove("active"); closeModal(); } }
  ]);
}

// 在游戏结束时自动记录
function autoRecord() {
  recordGame({
    rounds: G.counter || 0,
    totalGuesses: G.totalcounter || 0,
    score: G.score || 0,
    gold: G.gold || 0,
    gem: G.gem || 0,
    victory: G.victory ? 1 : 0,
    hero: G.hero,
    range: `${G.min}-${G.max}`,
    glory: G.glorycounter
  });
}

/* ===================== 初始化 ===================== */
function init() {
  bindEvents();
  // 恢复持久化的字体缩放设置
  const savedScale = localStorage.getItem("mn_font_scale");
  if (savedScale) {
    applyFontScale(parseInt(savedScale, 10));
    const slider = $("#fontSlider");
    if (slider) slider.value = savedScale;
  }
  runLoading();
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", () => {
  // 保持浮动按钮状态同步
  const active = $(".screen.active");
  if (active && active.id !== "menuScreen" && window.innerWidth <= 480) {
    $("#floatingBack").style.display = "block";
  } else if (active && active.id === "menuScreen") {
    $("#floatingBack").style.display = "none";
  }
});
