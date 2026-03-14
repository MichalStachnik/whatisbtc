import type { Quiz } from '@/types/content';

export const QUIZZES: Record<string, Quiz> = {
  'quiz-money-1': {
    id: 'quiz-money-1',
    title: 'What is Money?',
    questions: [
      {
        id: 'q1',
        question: 'Which property is NOT typically considered essential for good money?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'Scarcity', isCorrect: false, explanation: 'Scarcity is actually essential — if something can be created infinitely, it loses value.' },
          { id: 'b', text: 'Durability', isCorrect: false, explanation: 'Durability is important — money must hold up over time without degrading.' },
          { id: 'c', text: 'Popularity on social media', isCorrect: true, explanation: 'Correct! Social media popularity has nothing to do with what makes good money. Good money needs scarcity, durability, divisibility, portability, and fungibility.' },
          { id: 'd', text: 'Divisibility', isCorrect: false, explanation: 'Divisibility is essential — money must be breakable into smaller units to facilitate different-sized transactions.' },
        ],
      },
      {
        id: 'q2',
        question: 'What problem does the barter system suffer from?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'Transactions are too fast', isCorrect: false, explanation: 'Speed is not a problem with barter — the fundamental issue is finding a trading partner.' },
          { id: 'b', text: 'Double coincidence of wants', isCorrect: true, explanation: 'Exactly right! Barter requires that both parties want exactly what the other has, at the same time. Money solves this by acting as an intermediary.' },
          { id: 'c', text: 'Too many currencies exist', isCorrect: false, explanation: 'Barter actually has no currencies at all — that\'s what makes it difficult.' },
          { id: 'd', text: 'Transactions are recorded publicly', isCorrect: false, explanation: 'Barter has no public ledger — this is a feature of some monetary systems, not a barter problem.' },
        ],
      },
      {
        id: 'q3',
        question: 'Gold became widely used as money primarily because it:',
        xpReward: 25,
        options: [
          { id: 'a', text: 'Was declared legal tender by governments', isCorrect: false, explanation: 'Gold was used as money for thousands of years before governments formalized legal tender laws.' },
          { id: 'b', text: 'Is abundant and easy to mine', isCorrect: false, explanation: 'Actually the opposite — gold\'s scarcity and difficulty to mine are why it became valuable money.' },
          { id: 'c', text: 'Naturally has properties of good money: scarce, durable, divisible, portable', isCorrect: true, explanation: 'Correct! Gold emerged as money through voluntary market consensus because it naturally satisfied the key properties of good money better than alternatives.' },
          { id: 'd', text: 'Can be used to make jewelry', isCorrect: false, explanation: 'While gold has industrial uses, these weren\'t the primary reason it became money.' },
        ],
      },
      {
        id: 'q4',
        question: 'Fiat money derives its value from:',
        xpReward: 25,
        options: [
          { id: 'a', text: 'Gold reserves held by the central bank', isCorrect: false, explanation: 'Since 1971, fiat money is no longer backed by gold. The gold standard was abandoned.' },
          { id: 'b', text: 'The intrinsic value of the paper it\'s printed on', isCorrect: false, explanation: 'Paper itself has negligible value. A $100 bill costs about 17 cents to produce.' },
          { id: 'c', text: 'Government decree and social trust', isCorrect: true, explanation: 'Correct! "Fiat" comes from Latin meaning "let it be done." Fiat money\'s value comes from government mandate and the collective trust that others will accept it.' },
          { id: 'd', text: 'The labor required to print it', isCorrect: false, explanation: 'Labor cost of printing has no relationship to the face value of currency.' },
        ],
      },
    ],
  },

  'quiz-bitcoin-basics': {
    id: 'quiz-bitcoin-basics',
    title: 'Bitcoin Fundamentals',
    questions: [
      {
        id: 'q1',
        question: 'Who created Bitcoin?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'Elon Musk', isCorrect: false, explanation: 'Elon Musk did not create Bitcoin, though he has been a vocal supporter (and critic) of cryptocurrencies.' },
          { id: 'b', text: 'Satoshi Nakamoto', isCorrect: true, explanation: 'Correct! Bitcoin was created by Satoshi Nakamoto, a pseudonymous person or group, who published the Bitcoin whitepaper in October 2008 and launched the network in January 2009.' },
          { id: 'c', text: 'Vitalik Buterin', isCorrect: false, explanation: 'Vitalik Buterin created Ethereum in 2015, inspired by Bitcoin but with different goals.' },
          { id: 'd', text: 'The US Federal Reserve', isCorrect: false, explanation: 'Bitcoin was specifically designed to operate outside of central banking systems like the Federal Reserve.' },
        ],
      },
      {
        id: 'q2',
        question: 'What is the maximum supply of Bitcoin?',
        xpReward: 25,
        options: [
          { id: 'a', text: '100 million BTC', isCorrect: false, explanation: 'The actual cap is 21 million, not 100 million.' },
          { id: 'b', text: 'Unlimited', isCorrect: false, explanation: 'Bitcoin\'s fixed supply cap is one of its most important properties — it cannot be inflated arbitrarily.' },
          { id: 'c', text: '21 million BTC', isCorrect: true, explanation: 'Correct! Bitcoin\'s protocol hard-codes a maximum of 21 million BTC. This scarcity is built into the code and cannot be changed without consensus from the entire network.' },
          { id: 'd', text: '1 billion BTC', isCorrect: false, explanation: 'The supply cap is 21 million, a number chosen by Satoshi to make individual satoshis (0.00000001 BTC) valuable at scale.' },
        ],
      },
      {
        id: 'q3',
        question: 'Bitcoin\'s decentralization means:',
        xpReward: 25,
        options: [
          { id: 'a', text: 'One company controls the network', isCorrect: false, explanation: 'That would be centralization. Bitcoin has no central authority.' },
          { id: 'b', text: 'Transactions require bank approval', isCorrect: false, explanation: 'Bitcoin transactions require no bank or intermediary — that\'s a key feature.' },
          { id: 'c', text: 'No single entity controls the network', isCorrect: true, explanation: 'Correct! Bitcoin runs on thousands of nodes worldwide. No company, government, or individual controls it. Transactions are validated by consensus.' },
          { id: 'd', text: 'Bitcoin is stored in one secure location', isCorrect: false, explanation: 'The Bitcoin ledger is replicated across thousands of nodes globally — the opposite of being stored in one location.' },
        ],
      },
      {
        id: 'q4',
        question: 'What happens to Bitcoin\'s block reward approximately every 4 years?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'It doubles', isCorrect: false, explanation: 'The block reward decreases, not increases.' },
          { id: 'b', text: 'It stays the same', isCorrect: false, explanation: 'The halving event changes the reward on a regular schedule.' },
          { id: 'c', text: 'It is cut in half (halving)', isCorrect: true, explanation: 'Correct! Approximately every 210,000 blocks (~4 years), Bitcoin\'s block reward halves. This creates a predictable, decreasing issuance schedule — similar to gold becoming harder to mine over time.' },
          { id: 'd', text: 'It goes to zero immediately', isCorrect: false, explanation: 'The reward decreases gradually through halvings. The last BTC won\'t be mined until around 2140.' },
        ],
      },
    ],
  },

  'quiz-blockchain': {
    id: 'quiz-blockchain',
    title: 'Blockchain & Cryptography',
    questions: [
      {
        id: 'q1',
        question: 'What makes a blockchain immutable (tamper-resistant)?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'It\'s stored on a government server', isCorrect: false, explanation: 'Government servers are centralized and can be modified. Immutability comes from cryptographic linking, not storage location.' },
          { id: 'b', text: 'Each block contains the hash of the previous block', isCorrect: true, explanation: 'Exactly! Each block\'s hash depends on all previous block data. Changing any historical block would change its hash, breaking every subsequent block\'s validity — requiring re-mining the entire chain, which is computationally infeasible.' },
          { id: 'c', text: 'Blocks are encrypted with a secret password', isCorrect: false, explanation: 'The blockchain is actually publicly readable — its security comes from cryptographic linking, not encryption.' },
          { id: 'd', text: 'A central authority locks the data after writing', isCorrect: false, explanation: 'Bitcoin has no central authority. Immutability is achieved through distributed consensus and cryptographic proof-of-work.' },
        ],
      },
      {
        id: 'q2',
        question: 'What is a cryptographic hash function?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'A function that encrypts data so it can be decrypted later', isCorrect: false, explanation: 'Hash functions are one-way — you cannot reverse a hash to get the original data. Encryption is reversible; hashing is not.' },
          { id: 'b', text: 'A one-way function that converts any input into a fixed-length output', isCorrect: true, explanation: 'Correct! Hash functions take any input and produce a fixed-length fingerprint. The same input always produces the same hash, but you cannot determine the input from the hash.' },
          { id: 'c', text: 'A method for generating random numbers', isCorrect: false, explanation: 'Hash functions are deterministic — the same input always gives the same output. They\'re not random number generators.' },
          { id: 'd', text: 'A digital signature algorithm', isCorrect: false, explanation: 'Digital signatures use public-key cryptography (like ECDSA), which is different from hash functions, though both are used in Bitcoin.' },
        ],
      },
      {
        id: 'q3',
        question: 'What does "proof of work" require miners to do?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'Prove they own Bitcoin', isCorrect: false, explanation: 'Proof of ownership uses digital signatures. Proof of work is about computational effort.' },
          { id: 'b', text: 'Find a number (nonce) that makes the block hash meet a target', isCorrect: true, explanation: 'Correct! Miners must repeatedly hash block data with different nonces until they find a hash below the target difficulty. This is computationally expensive but easy for others to verify.' },
          { id: 'c', text: 'Hold a minimum amount of Bitcoin', isCorrect: false, explanation: 'That describes proof of stake. Proof of work requires computational power, not Bitcoin holdings.' },
          { id: 'd', text: 'Sign a legal document', isCorrect: false, explanation: 'Proof of work is purely mathematical — finding a hash that meets certain criteria, requiring real-world energy expenditure.' },
        ],
      },
      {
        id: 'q4',
        question: 'A Bitcoin private key is:',
        xpReward: 30,
        options: [
          { id: 'a', text: 'Your wallet address that others send BTC to', isCorrect: false, explanation: 'That\'s your public address, derived from your public key. Your private key must never be shared.' },
          { id: 'b', text: 'A secret number that proves ownership and signs transactions', isCorrect: true, explanation: 'Correct! Your private key is a 256-bit secret number. It\'s used to sign transactions, proving you own the Bitcoin being spent — without revealing the key itself.' },
          { id: 'c', text: 'Your username on the Bitcoin network', isCorrect: false, explanation: 'Bitcoin has no usernames. Identity is represented by cryptographic keys, not usernames.' },
          { id: 'd', text: 'A password that Bitcoin miners use', isCorrect: false, explanation: 'Miners don\'t use private keys to mine. They use computational power to find valid block hashes.' },
        ],
      },
    ],
  },

  'quiz-wallets': {
    id: 'quiz-wallets',
    title: 'Wallets & Transactions',
    questions: [
      {
        id: 'q1',
        question: 'A Bitcoin "wallet" actually stores:',
        xpReward: 25,
        options: [
          { id: 'a', text: 'Bitcoin coins physically', isCorrect: false, explanation: 'Bitcoin is purely digital. There are no physical coins stored anywhere.' },
          { id: 'b', text: 'Your private keys (which give access to your Bitcoin on the blockchain)', isCorrect: true, explanation: 'Correct! Bitcoin exists on the blockchain, not in your wallet. Your wallet stores the private keys that allow you to spend the Bitcoin recorded at your address on the blockchain.' },
          { id: 'c', text: 'A backup of the entire blockchain', isCorrect: false, explanation: 'Full nodes store the blockchain, but most wallets don\'t. They typically just store keys and query nodes for balance information.' },
          { id: 'd', text: 'Your transaction history in a local database', isCorrect: false, explanation: 'Transaction history is public on the blockchain. Your wallet may display it, but it\'s not what wallets "store."' },
        ],
      },
      {
        id: 'q2',
        question: 'What is a "cold wallet" or "cold storage"?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'A wallet kept in a freezer for security', isCorrect: false, explanation: 'Temperature has nothing to do with it! "Cold" refers to being offline.' },
          { id: 'b', text: 'An internet-connected wallet app on your phone', isCorrect: false, explanation: 'That would be a "hot wallet." Cold wallets are specifically offline.' },
          { id: 'c', text: 'A hardware device or paper wallet that stores keys offline', isCorrect: true, explanation: 'Correct! Cold storage keeps your private keys offline, making them inaccessible to hackers. Hardware wallets like Ledger or Trezor, or even a piece of paper with your seed phrase, are examples.' },
          { id: 'd', text: 'A wallet with a password', isCorrect: false, explanation: 'Most wallets have passwords. Cold storage specifically refers to offline key storage.' },
        ],
      },
      {
        id: 'q3',
        question: 'What is the most important rule for your seed phrase (recovery phrase)?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'Store it in a cloud service like Google Drive for easy access', isCorrect: false, explanation: 'Never store your seed phrase digitally or in cloud services — this makes it vulnerable to online hacks.' },
          { id: 'b', text: 'Share it with your exchange for safekeeping', isCorrect: false, explanation: 'Never share your seed phrase with anyone, including exchanges. "Not your keys, not your coins."' },
          { id: 'c', text: 'Write it down on paper and keep it offline in a secure location', isCorrect: true, explanation: 'Correct! Your 12 or 24-word seed phrase is the master key to all your Bitcoin. Write it on paper (never digitally), store it securely offline, and never share it.' },
          { id: 'd', text: 'Memorize it and never write it down', isCorrect: false, explanation: 'Memorization alone is risky — human memory is fallible. You should write it down physically, securely.' },
        ],
      },
      {
        id: 'q4',
        question: 'What does "not your keys, not your coins" mean?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'You should never use Bitcoin exchanges', isCorrect: false, explanation: 'Exchanges have legitimate uses. The saying warns about the risks of leaving Bitcoin on exchanges long-term.' },
          { id: 'b', text: 'If someone else controls your private keys (like an exchange), they control your Bitcoin', isCorrect: true, explanation: 'Correct! When you leave Bitcoin on an exchange, you don\'t hold the private keys — the exchange does. If the exchange is hacked, goes bankrupt, or freezes withdrawals, you may lose access. Self-custody with your own keys is safer.' },
          { id: 'c', text: 'Bitcoin keys can only be owned by one person at a time', isCorrect: false, explanation: 'Multisignature (multisig) Bitcoin wallets allow multiple key holders. The saying is about counterparty risk.' },
          { id: 'd', text: 'Physical coins have more value than digital Bitcoin', isCorrect: false, explanation: 'This saying is about digital key custody, not physical vs digital.' },
        ],
      },
    ],
  },

  'quiz-history': {
    id: 'quiz-history',
    title: 'Bitcoin History & Economics',
    questions: [
      {
        id: 'q1',
        question: 'When was the Bitcoin whitepaper published?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'January 2009', isCorrect: false, explanation: 'January 2009 is when the Bitcoin network launched (genesis block). The whitepaper came slightly earlier.' },
          { id: 'b', text: 'October 2008', isCorrect: true, explanation: 'Correct! Satoshi Nakamoto published "Bitcoin: A Peer-to-Peer Electronic Cash System" on October 31, 2008 — just weeks after the 2008 financial crisis peaked with Lehman Brothers\'s collapse.' },
          { id: 'c', text: 'March 2010', isCorrect: false, explanation: 'By 2010, Bitcoin already had a functioning network and even early commercial transactions.' },
          { id: 'd', text: 'December 2012', isCorrect: false, explanation: 'The first Bitcoin halving happened in November 2012. The whitepaper was 4 years earlier.' },
        ],
      },
      {
        id: 'q2',
        question: 'What was the first real-world Bitcoin purchase?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'A Tesla car for 10,000 BTC', isCorrect: false, explanation: 'Tesla didn\'t accept Bitcoin until 2021, long after the famous "Bitcoin Pizza Day."' },
          { id: 'b', text: 'Two pizzas for 10,000 BTC (Bitcoin Pizza Day)', isCorrect: true, explanation: 'Correct! On May 22, 2010, Laszlo Hanyecz paid 10,000 BTC for two Papa John\'s pizzas. Now celebrated as "Bitcoin Pizza Day," those coins would be worth hundreds of millions today.' },
          { id: 'c', text: 'A house for 50 BTC', isCorrect: false, explanation: 'The first recorded real-world commercial transaction was the famous pizza purchase.' },
          { id: 'd', text: 'Coffee at a café for 1 BTC', isCorrect: false, explanation: 'The famous first real-world purchase was 10,000 BTC for two pizzas in 2010.' },
        ],
      },
      {
        id: 'q3',
        question: 'What is the Austrian School of Economics\' view most aligned with Bitcoin?',
        xpReward: 25,
        options: [
          { id: 'a', text: 'Governments should print money freely to stimulate growth', isCorrect: false, explanation: 'That\'s a Keynesian view. Austrian economics warns that money printing leads to inflation and malinvestment.' },
          { id: 'b', text: 'Sound money with fixed supply prevents inflation and distorts the economy less', isCorrect: true, explanation: 'Correct! Austrian economists like Ludwig von Mises and Friedrich Hayek argued for sound money with fixed or predictable supply. Bitcoin\'s 21M cap directly embodies this principle.' },
          { id: 'c', text: 'Central banks are necessary for economic stability', isCorrect: false, explanation: 'Austrian economists are generally critical of central banking, arguing it creates boom-bust cycles through artificial credit expansion.' },
          { id: 'd', text: 'Inflation is necessary and healthy for an economy', isCorrect: false, explanation: 'Austrian economics views inflation as a harmful tax on savers and a distortion of price signals.' },
        ],
      },
      {
        id: 'q4',
        question: 'What was the "genesis block" message and why is it significant?',
        xpReward: 25,
        options: [
          { id: 'a', text: '"Hello, World!" — a standard programming test message', isCorrect: false, explanation: 'The message had deep political significance, not just a test.' },
          { id: 'b', text: '"The Times 03/Jan/2009 Chancellor on brink of second bailout for banks" — embedding Bitcoin\'s motivation', isCorrect: true, explanation: 'Correct! Satoshi embedded a newspaper headline about bank bailouts in Bitcoin\'s first block. This timestamp proves Bitcoin wasn\'t pre-mined and symbolizes why it was created: as an alternative to the failing legacy financial system.' },
          { id: 'c', text: '"In cryptography we trust" — expressing the cypherpunk philosophy', isCorrect: false, explanation: 'While Bitcoin is deeply cypherpunk, this wasn\'t the actual genesis block message.' },
          { id: 'd', text: 'It contained no message — just transaction data', isCorrect: false, explanation: 'Satoshi deliberately included a meaningful message in the coinbase field of the genesis block.' },
        ],
      },
    ],
  },

  'quiz-lightning': {
    id: 'quiz-lightning',
    title: 'Lightning Network',
    questions: [
      {
        id: 'q1',
        question: 'Why can\'t Bitcoin simply process thousands of transactions per second on-chain?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'Bitcoin\'s code has never been updated', isCorrect: false, explanation: 'Bitcoin has had numerous upgrades. The throughput limit is a deliberate design trade-off, not neglect.' },
          { id: 'b', text: 'Increasing block size enough for global payments would require powerful servers to run nodes, harming decentralization', isCorrect: true, explanation: 'Correct! Bitcoin deliberately limits throughput to preserve decentralization. Anyone should be able to run a full node on modest hardware. Massive blocks would centralize validation to data centers.' },
          { id: 'c', text: 'There isn\'t enough demand for Bitcoin transactions', isCorrect: false, explanation: 'During bull markets, Bitcoin has repeatedly experienced high fees and backlogged mempools — clearly showing real demand.' },
          { id: 'd', text: 'Lightning Network blocks on-chain scaling', isCorrect: false, explanation: 'Lightning is a solution built on top of the base layer, not a blocker to scaling.' },
        ],
      },
      {
        id: 'q2',
        question: 'What is required to open a Lightning payment channel?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'Registering with a Lightning Network authority', isCorrect: false, explanation: 'Lightning is permissionless — no registration or central authority is required.' },
          { id: 'b', text: 'A single on-chain Bitcoin transaction locking funds into a 2-of-2 multisig address', isCorrect: true, explanation: 'Correct! Opening a channel requires one on-chain "funding transaction." After that, all channel payments are off-chain and instant until the channel is eventually closed.' },
          { id: 'c', text: 'A minimum balance of 1 BTC', isCorrect: false, explanation: 'Lightning channels can be opened with any amount. There is no required minimum of 1 BTC.' },
          { id: 'd', text: 'Permission from a routing node', isCorrect: false, explanation: 'Anyone can open a channel with anyone without permission from any routing node.' },
        ],
      },
      {
        id: 'q3',
        question: 'What prevents a party from cheating by broadcasting an old channel state?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'The Bitcoin network automatically detects and rejects old states', isCorrect: false, explanation: 'Bitcoin\'s base layer doesn\'t know about Lightning channel history. The punishment is enforced by the Lightning protocol itself.' },
          { id: 'b', text: 'Old channel states are cryptographically destroyed when updated', isCorrect: false, explanation: 'Old states still exist as signed transactions. Broadcasting them triggers the revocation penalty — that\'s what deters cheating.' },
          { id: 'c', text: 'Broadcasting an old state allows the counterparty to claim all channel funds as a penalty', isCorrect: true, explanation: 'Correct! Each update gives the counterparty a "revocation secret" usable to claim all channel funds if you broadcast a superseded state. This makes cheating economically irrational.' },
          { id: 'd', text: 'Channels auto-close after each payment to prevent cheating', isCorrect: false, explanation: 'Channels stay open through many payments. Auto-closing would defeat the purpose of off-chain transactions.' },
        ],
      },
      {
        id: 'q4',
        question: 'What does "inbound liquidity" mean in Lightning?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'The amount of Bitcoin you can send from your channels', isCorrect: false, explanation: 'That\'s outbound liquidity. Inbound liquidity is specifically about capacity to receive.' },
          { id: 'b', text: 'The total Bitcoin locked across the entire Lightning Network', isCorrect: false, explanation: 'That\'s total network capacity. Inbound liquidity refers to your personal ability to receive payments.' },
          { id: 'c', text: 'Channel capacity on the remote side, allowing others to send payments to you', isCorrect: true, explanation: 'Correct! To receive Lightning payments, you need capacity on the far side of your channels. If you funded all channels yourself, you start with zero inbound and cannot receive until you\'ve sent some outbound capacity.' },
          { id: 'd', text: 'The maximum routing fee you can earn forwarding payments', isCorrect: false, explanation: 'Routing fees relate to forwarding payments through your node, not to inbound liquidity specifically.' },
        ],
      },
    ],
  },

  'quiz-upgrades': {
    id: 'quiz-upgrades',
    title: 'Protocol Upgrades',
    questions: [
      {
        id: 'q1',
        question: 'What core problem did Segregated Witness (SegWit) solve?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'It increased the 21 million BTC supply cap', isCorrect: false, explanation: 'The 21 million cap is a core property of Bitcoin that no upgrade has or can change without destroying Bitcoin\'s value proposition.' },
          { id: 'b', text: 'Transaction malleability — third parties could alter a transaction\'s ID before confirmation', isCorrect: true, explanation: 'Correct! SegWit separates signature data from the data used to compute the TXID, eliminating transaction malleability. This bug had been exploited at Mt. Gox and prevented reliable second-layer protocol construction.' },
          { id: 'c', text: 'It made Bitcoin transactions fully anonymous', isCorrect: false, explanation: 'Bitcoin is pseudonymous. SegWit improved efficiency and fixed malleability but did not add anonymity.' },
          { id: 'd', text: 'It doubled Bitcoin\'s block confirmation speed', isCorrect: false, explanation: 'Block time is set by the difficulty adjustment, not by SegWit. SegWit increased capacity within blocks, not block speed.' },
        ],
      },
      {
        id: 'q2',
        question: 'What is the key advantage of Schnorr key aggregation (MuSig)?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'It makes Bitcoin quantum-resistant', isCorrect: false, explanation: 'Schnorr signatures use the same elliptic curve math as ECDSA and are not quantum-resistant. Post-quantum cryptography is a separate challenge.' },
          { id: 'b', text: 'A multisig setup can look identical to a single-sig payment on-chain, improving privacy', isCorrect: true, explanation: 'Correct! With MuSig, multiple signers combine their keys into one. A 5-of-7 multisig looks like a regular single-key spend on-chain, hiding the complex spending condition from public view.' },
          { id: 'c', text: 'It eliminates the need for private keys entirely', isCorrect: false, explanation: 'All asymmetric cryptography requires private keys. Schnorr uses them like ECDSA, just with different mathematical properties.' },
          { id: 'd', text: 'It allows miners to create Bitcoin beyond the 21 million cap', isCorrect: false, explanation: 'No signature algorithm can change Bitcoin\'s supply. The 21 million cap is enforced independently by all full nodes.' },
        ],
      },
      {
        id: 'q3',
        question: 'What is the difference between a soft fork and a hard fork?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'Soft forks add features; hard forks remove them', isCorrect: false, explanation: 'Both can add or change features. The key distinction is backward compatibility, not what kind of change is made.' },
          { id: 'b', text: 'A soft fork is backward-compatible (old nodes accept new blocks); a hard fork requires all nodes to upgrade or they split onto a different chain', isCorrect: true, explanation: 'Correct! Soft forks tighten rules in a way old nodes still accept. Hard forks change rules such that old nodes reject new blocks, potentially creating two incompatible chains.' },
          { id: 'c', text: 'Hard forks are more secure than soft forks', isCorrect: false, explanation: 'Security is unrelated to fork type. Hard forks are typically riskier because they risk network splits and weaken the credibility of rule immutability.' },
          { id: 'd', text: 'Soft forks require government approval; hard forks don\'t', isCorrect: false, explanation: 'Bitcoin requires no government approval for any changes. Governance happens through node operator consensus.' },
        ],
      },
      {
        id: 'q4',
        question: 'What does MAST (Merkelized Abstract Syntax Tree) enable in Taproot?',
        xpReward: 30,
        options: [
          { id: 'a', text: 'Faster Bitcoin block production', isCorrect: false, explanation: 'MAST is a privacy and scripting feature. Block production speed is controlled by the difficulty adjustment.' },
          { id: 'b', text: 'Complex spending conditions where only the executed branch is revealed on-chain, hiding unused paths', isCorrect: true, explanation: 'Correct! MAST commits multiple spending conditions to a Merkle tree. When spending, only the used branch is revealed. Unused conditions stay private, making complex contracts look like ordinary payments.' },
          { id: 'c', text: 'The ability to send Bitcoin to multiple recipients in one signature', isCorrect: false, explanation: 'That\'s a basic Bitcoin transaction feature. MAST specifically enables private complex spending conditions via Merkle trees.' },
          { id: 'd', text: 'Mining Bitcoin without proof of work', isCorrect: false, explanation: 'Proof of work is Bitcoin\'s consensus mechanism, completely unrelated to MAST or Taproot scripting.' },
        ],
      },
    ],
  },
};

export function getQuiz(quizId: string): Quiz | undefined {
  return QUIZZES[quizId];
}
