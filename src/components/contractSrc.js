export const contractSource = `contract CryptoHamster =

   record state = {
      index : int,
      map_hamsters : map(string, hamster)}

   record hamster = {
      id: int,
      name: string,
      dna: int}

   stateful entrypoint init() = 
      { index = 1,
         map_hamsters = {}}

   stateful entrypoint create_hamster(hamster_name: string) =
      require(!name_exists(hamster_name), "Name is already taken")
      let dna : int = generate_random_dna()
      create_hamster_by_name_dna(hamster_name, dna)
      

   entrypoint name_exists(name: string) : bool =
      Map.member(name, state.map_hamsters)

   entrypoint get_hamster_dna(name: string) : int =
      require(name_exists(name), "There is no hamster with that name!")
      let needed_hamster : hamster = state.map_hamsters[name]
      needed_hamster.dna

   stateful function create_hamster_by_name_dna(name: string, dna: int) =
      let new_hamster : hamster = {
         id = state.index,
         name = name,
         dna = dna}

      put(state{map_hamsters[name] = new_hamster})
      put(state{index = (state.index + 1)})

   function generate_random_dna() : int =
      get_block_hash_bytes_as_int() - Chain.timestamp + state.index
      

   function get_block_hash_bytes_as_int() : int =
      switch(Chain.block_hash(Chain.block_height - 1))
         None => abort("blockhash not found")
         Some(bytes) => Bytes.to_int(bytes)`