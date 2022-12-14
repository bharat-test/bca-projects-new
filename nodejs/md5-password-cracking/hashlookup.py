#!/usr/bin/env python3
'''
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
---------------------------------------------------------------------
The first step in creating a cryptographic hash lookup table.
Creates a file of the following format:

    [HASH_PART][WORDLIST_OFFSET][HASH_PART][WORDLIST_OFFSET]...

HASH_PART is the first 64 BITS of the hash, right-padded with zeroes if
necessary.  WORDLIST_OFFSET is the position of the first character of the
word in the dictionary encoded as a 48-bit LITTLE ENDIAN integer.
'''


import os
import sys
import time
import struct
import hashlib
import argparse
import platform
import logging

from binascii import hexlify, unhexlify

# Because Python 3 is fucking stupid
try:
    from .algorithms import algorithms
except ImportError:
    from algorithms import algorithms


# Pretty colors :D
if platform.system().lower() in ['linux', 'darwin']:
    W = "\033[0m"  # default/white
    R = "\033[31m"  # red
    P = "\033[35m"  # purple
    C = "\033[36m"  # cyan
    bold = "\033[1m"
else:
    bold = W = R = P = C = ""

INFO = bold + C + "[*] " + W
WARN = bold + R + "[!] " + W
MONEY = bold + P + "[$] " + W

POS_SIZE = 6
HASH_SIZE = 8
ENTRY_SIZE = POS_SIZE + HASH_SIZE



class LookupTable(object):

    LOGGER = logging.getLogger(__file__)

    def __init__(self, algorithm, index_file, wordlist_file, verbose=False):
        self.verbose = verbose
        self._lower = 0
        self._cache = {}
        if algorithm not in algorithms:
            raise ValueError('Algorithm is not supported')
        self.algorithm = algorithms[algorithm]
        self._info('Algorithm is set to %s' % algorithm)
        self.fp_index = self._open(index_file)
        self.fp_wordlist = self._open(wordlist_file)
        if self.fp_index is None:
            raise ValueError('Index file not found, or not readable')
        if self.fp_wordlist is None:
            raise ValueError('Wordlist file not found, or not readable')
        if self.index_size % ENTRY_SIZE:
            raise ValueError('Invalid index file')
        self.index_count = self.index_size // ENTRY_SIZE
        self._info("Checking %s indexes ..." % self.index_count)

    def __getitem__(self, items):
        if isinstance(items, str):
            items = [items]
        if not isinstance(items, list):
            raise ValueError('Index must be type basestring or list')
        return self.get_all(items)

    def __del__(self):
        if self.fp_index is not None and not self.fp_index.closed:
            self.fp_index.close()
        if self.fp_wordlist is not None and not self.fp_wordlist.closed:
            self.fp_wordlist.close()

    @property
    def index_size(self):
        return os.path.getsize(self.fp_index.name)

    @property
    def words(self):
        return self.index_size // ENTRY_SIZE

    @property
    def wordlist_size(self):
        return os.path.getsize(self.fp_wordlist.name)

    def _info(self, msg):
        if self.verbose:
            sys.stdout.write(INFO + msg + '\n')
            sys.stdout.flush()
        self.LOGGER.info(msg)

    def _warn(self, msg):
        if self.verbose:
            sys.stdout.write(WARN + msg + '\n')
            sys.stdout.flush()
        else:
            self.LOGGER.warn(msg)

    def _open(self, file_path):
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return open(file_path, 'rb')
        else:
            return None

    def get_all(self, targets):
        ''' Crack a list of hashes '''
        results = {}
        for digest in sorted(targets):
            results[digest] = self._crack(digest)
        self._lower = 0
        return results

    def _crack(self, hexdigest):
        self._info("Cracking hash %s" % hexdigest)
        needle = unhexlify(hexdigest)[:8]
        collision = self._find_collision(needle)
        if collision is not None:
            self._info("Collision found at offset 0x%x" % collision)
            index = self._walk_back(collision, needle)
            while self._idx_digest(index) == needle:
                fpos = self._idx_position(index)
                self._info("Testing collision at 0x%x" % fpos)
                word = self._word_at(fpos)
                self._info("Possible preimage: %s" % word)
                algo = self.algorithm()
                algo.update(word)
                if algo.hexdigest().decode() == hexdigest:
                    self._info("Found match at 0x%x -> '%s'" % (fpos, word))
                    return word
                else:
                    self._info("False alarm: %s != %s" % (word, hexdigest,))
                index += 1
        self._warn("No matches found for: %s" % hexdigest)
        return None

    def _find_collision(self, needle):
        lower = self._lower
        upper = self.index_count - 1
        while upper >= lower:
            middle = lower + ((upper - lower) // 2)
            idx_digest = self._idx_digest(middle)
            if idx_digest > needle:
                self._info("Target is lower than %r" % middle)
                upper = middle - 1
            elif idx_digest < needle:
                self._info("Target is higher than %r" % middle)
                lower = middle + 1
            else:
                return middle
        return None

    def _walk_back(self, collision, needle):
        self._info("Finding first collision in block ...")
        if 0 < collision:
            while self._idx_digest(collision) == needle:
                collision -= 1
            collision += 1
        self._lower = collision
        return collision

    def _idx_digest(self, index):
        if index not in self._cache:
            self.fp_index.seek(int(index * ENTRY_SIZE))
            self._cache[index] = self.fp_index.read(HASH_SIZE)
        return self._cache[index]

    def _idx_position(self, index):
        self.fp_index.seek((index * ENTRY_SIZE) + HASH_SIZE)
        fpos = self.fp_index.read(POS_SIZE)
        return struct.unpack('<Q', fpos + b'\x00\x00')[0]

    def _word_at(self, offset):
        self.fp_wordlist.seek(offset)
        return self.fp_wordlist.readline().decode().strip()

if __name__ == '__main__':

    def _cli(args, table):
        if os.path.exists(args.hash[0]) and os.path.isfile(args.hash[0]):
            with open(args.hash[0]) as fp:
                hashes = [line.strip() for line in fp]
        else:
            hashes = args.hash
        if args.decoder is not None:
            hashes = [hsh.decode(args.decoder) for hsh in hashes]
        start = time.time()
        results = table[hashes]
        lookup_time = time.time() - start
        #sys.stdout.write('\n\t\t*** Results ***\n\n')
        cracked = {k: v for k, v in results.items() if v is not None}
        for index, hsh in enumerate(cracked):
            sys.stdout.write("%d)  %s -> %s\n" % (index, hsh, results[hsh],))
            sys.stdout.flush()
        #sys.stdout.write("%sTotal lookup time: %.6f\n" % (INFO, lookup_time))
        percent = 100 * len(cracked) / len(hashes)
        #sys.stdout.write("%sCracked %d of %d (%3.2f%s)\n" % (MONEY, len(cracked), len(hashes), percent, '%'))
        sys.stdout.flush()

    parser = argparse.ArgumentParser(description='Search sorted IDX files for hashes')
    parser.add_argument('-v', '--version',
                        action='version',
                        version='hashlookup 0.1.3')
    parser.add_argument('-d', '--debug',
                        action='store_true',
                        dest='debug',
                        help='debug/verbose mode')
    parser.add_argument('-e', '--decoder',
                        dest='decoder',
                        help='decode hashes using an encoder')
    parser.add_argument('-w', '--wordlist',
                        dest='wordlist',
                        help='wordlist file',
                        required=True)
    parser.add_argument('-i', '--index',
                        dest='index',
                        help='the .idx file matching the wordlist',
                        required=True)
    parser.add_argument('-a', '--algorithm',
                        dest='algorithm',
                        help='hashing algorithm: %s' % sorted(algorithms.keys()),
                        required=True)
    parser.add_argument('-c', '--crack',
                        nargs='*',
                        dest='hash',
                        help='crack a file or list of hashes')
    args = parser.parse_args()
    table = LookupTable(
        algorithm=args.algorithm.lower(),
        index_file=args.index,
        wordlist_file=args.wordlist,
        verbose=args.debug)
    if args.hash is not None:
        _cli(args, table)
    else:
        sys.stdout.write(WARN + 'No input hashes, see --help\n')
        sys.stdout.flush()
