"use client";

import { motion } from "framer-motion";

export default function StorylineSection({ t }: { t: any }) {
  const storyParagraphs = [
    "When the world was rising from its ashes…",
    "Cities were not built by luck… but by will.",
    "And here…\nThis is where the story begins.",
    "There was no past to remember.\nNo legacy to inherit.\nNo history written in stone.",
    "Only land.\nEmpty… silent… waiting.",
    "A city born from nothing.",
    "No names. No rulers. No empires.\nJust opportunity.",
    "At the beginning, no one owns anything.\nNo power. No wealth. No influence.",
    "Every person who steps into this city carries nothing but ambition… and the will to build something from it.",
    "But this city does not reward ambition alone.\nIt demands more.\nIt demands decisions.",
    "Some choose the path of trade.\nThey enter a world where nothing is guaranteed, where every deal is a risk and every opportunity comes at a cost. Markets shift without warning. Prices rise and fall like tides.",
    "Here, intelligence is worth more than strength.\nA single good decision can build a fortune.\nA single mistake… can erase it.",
    "Others are drawn to industry.\nTo the sound of machines.\nTo the weight of production.\nTo the transformation of raw materials into something greater.",
    "Iron becomes structure.\nStructure becomes power.\nAnd those who control production… slowly begin to shape the city itself.",
    "But industry is not forgiving.\nIt consumes time, resources… and sometimes, the people behind it.",
    "Beyond the machines lies the land.\nQuiet. Vast. Essential.\nIt feeds the city. Sustains it. Keeps it alive.",
    "And those who choose to work it understand one truth very quickly:\nControlling food… is controlling survival.",
    "But the land gives only to those who respect it.\nAnd it takes back from those who don’t.",
    "Deep beneath the surface… another world exists.\nDark. Silent. Untouched.\nResources hidden for those willing to search.",
    "But nothing buried stays hidden without reason.\nAnd nothing valuable comes without a price.",
    "Some will dig for wealth.\nOthers will dig… and find something else entirely.",
    "Then there is oil.\nInvisible at first.\nYet present in everything.",
    "It fuels movement. Powers industry. Connects every system within the city.\nThose who control it may never be seen…\nBut their influence is everywhere.",
    "And above it all… power begins to take shape.\nNot through strength alone… but through control.",
    "Laws are written.\nDecisions are made.\nAlliances are formed.",
    "Some rise through leadership.\nOthers rise through manipulation.",
    "And in time, positions of authority begin to emerge — not given… but taken.",
    "Because in this city…\nPower is never handed to you.\nYou claim it.",
    "But no one builds alone.\nNot for long.",
    "Families begin to form.\nGroups unite under shared goals… shared interests… shared ambitions.",
    "Trust is built.\nLoyalty is tested.",
    "And slowly… those small groups begin to grow into something much bigger.\nSomething stronger.\nEmpires.",
    "And where empires rise…\nConflict follows.\nIt is inevitable.",
    "Today’s ally may stand beside you.\nTomorrow… they may stand against you.",
    "Because in a city built from nothing…\nThere are no permanent friendships.\nOnly permanent interests.",
    "Everything begins small.\nA simple job.\nA small deal.\nA single decision made without knowing its consequences.",
    "But time changes everything.\nThat small beginning can grow into influence.\nInto control.\nInto something unstoppable.",
    "Or it can collapse…\nLeaving behind nothing but a name people used to remember.",
    "This city is not just a place.\nIt is a test.\nAn opportunity.\nA battlefield of ambition, where every choice shapes your future.\nAnd every action… writes your story.",
    "Some will rise.\nOthers will fall.\nMost will try.\nFew will succeed.",
    "And while the city builds itself through the hands of its people…\nWhile empires slowly begin to take form…\nWhile alliances are made and broken…",
    "There is something else.\nSomething unseen.\nSomething silent.",
    "Watching.\nNot interfering.\nNot revealing itself.\nJust observing.\nWaiting.",
    "Because this city… may belong to those who build it.",
    "But the story behind it…\nHas already begun."
  ];

  return (
    <section className="relative py-32 bg-[#0a0514] overflow-hidden flex flex-col items-center justify-center">
      {/* Background Cinematic Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-900/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-blue-900/10 blur-[120px] pointer-events-none rounded-full" />
      
      {/* Grid overlay for texture */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        {/* Title */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-6xl font-bold font-orbitron tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] mb-4">
            SEASON 3.0
          </h2>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto mb-4" />
          <h3 className="text-xl md:text-2xl font-inter font-light tracking-[0.2em] text-gray-400 uppercase">
            The Rise of Empires
          </h3>
        </motion.div>

        {/* Story Text */}
        <div className="flex flex-col gap-12 md:gap-16">
          {storyParagraphs.map((paragraph, index) => {
            const isEmphasized = 
                paragraph.includes("Only land.") || 
                paragraph.includes("Empires.") ||
                paragraph.includes("Has already begun.");
                
            return (
              <motion.div
                key={index}
                className="text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <p className={`whitespace-pre-line font-inter leading-relaxed ${
                    isEmphasized 
                    ? "text-2xl md:text-3xl text-purple-300 font-bold tracking-wide" 
                    : "text-lg md:text-xl text-gray-400 font-light"
                }`}>
                  {paragraph}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a0514] to-transparent pointer-events-none z-20" />
    </section>
  );
}
